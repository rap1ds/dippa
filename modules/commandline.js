var spawn = require('child_process').spawn;
var p = require("promised-io/promise");;
var when = p.when;
var Promise = p.Promise;
var log = require('../modules/log');
var _ = require('underscore');

function logOutput(output) {
    output = output || {};
    log('[' + output.type + ']' + ' ' + output.output);
}

function mergeQuotes(quoteMark) {
    return function(previousValues, currentValue){
        var previous = _.last(previousValues) || "";
        var inQuote = previous.split(quoteMark).length % 2 === 0;

        if(inQuote) {
            return _.initial(previousValues).concat(previous + " " + currentValue);
        } else {
            return previousValues.concat(currentValue);
        }
    }
}

var CommandLine = {

    _splitCmd: function(cmd) {
        var cmdParts = cmd.split(' ');

        cmdParts = cmdParts.reduce(mergeQuotes("'"), []);
        cmdParts = cmdParts.reduce(mergeQuotes('"'), []);

        var command = cmdParts.shift();

        for(var i = 0; i < cmdParts.length; i++) {
            cmdParts[i] = cmdParts[i].replace(/%%/g, ' ');
        }

        return {cmd: command, args: cmdParts};
    },

    _run: function(promise, cmd, args, workingDir) {
        var spawnOperation = spawn(cmd, args, {cwd: workingDir});

        var output = new CommandLine.Output();

        spawnOperation.on('exit', function(code) {
            promise.resolve(output.getOutput());
        });
        spawnOperation.stdout.on('data', function (data) {
            var string = data.toString('utf-8');
            output.stdout(string);
        });

        spawnOperation.stderr.on('data', function (data) {
            var string = data.toString('utf-8');
            output.stderr(string);
        });

        spawnOperation.on('error', function(e) {
            log.error(['An error occured while running command', cmd, 'with args', args]);
            log.error(e);
        });
    },

    runAll: function(commands) {
        var promise = new Promise();
        var allOutputs = [];

        function runCommand() {
            var commandToRun = commands.shift();

            if(commandToRun) {
                commandToRun.promise.then(function(output) {
                    allOutputs = allOutputs.concat(output);
                    runCommand();
                });
                commandToRun.run();
            } else {
                (allOutputs || []).forEach(logOutput);
                promise.resolve(allOutputs);
            }
        }

        runCommand();

        return promise;
    }
}

CommandLine.Output = function() {
    this.allOutputs = [];
    this.stdoutBuffer;
    this.stderrBuffer;
}

CommandLine.Output.prototype.stdout = function(output) {
    // Add to buffer
    var buf = this.stdoutBuffer || "";
    this.stdoutBuffer = buf + output;

    // Flush buffer
    this.flushStderr(true);
    this.flushStdout();
}

CommandLine.Output.prototype.flushStdout = function(forceEmpty) {
    if(!this.stdoutBuffer) {
        return;
    }

    var lines = this.stdoutBuffer.split('\n');
    var len = lines.length;

    for(var i = 0; i < len - 1; i++) {
        var line = lines.shift();
        this.allOutputs.push({type: "stdout", output: line});
    }

    // Last line
    if(len > 0 && forceEmpty === true) {
        var lastLine = lines.shift();
        this.allOutputs.push({type: "stdout", output: lastLine});
        this.stdoutBuffer = null;
    } else {
        this.stdoutBuffer = lines.shift();
    }
}

CommandLine.Output.prototype.stderr = function(output) {
    // Add to buffer
    var buf = this.stderrBuffer || "";
    this.stderrBuffer = buf + output;

    // Flush buffer
    this.flushStdout(true);
    this.flushStderr();
}

CommandLine.Output.prototype.flushStderr = function(forceEmpty) {
    if(!this.stderrBuffer) {
        return;
    }

    var lines = this.stderrBuffer.split('\n');
    var len = lines.length;

    // More than one line
    for(var i = 0; i < len - 1; i++) {
        var line = lines.shift();
        this.allOutputs.push({type: "stderr", output: line});
    }

    // Last line
    if(len > 0 && forceEmpty === true) {
        var lastLine = lines.shift();
        this.allOutputs.push({type: "stderr", output: lastLine});
    }
}

CommandLine.Output.prototype.getOutput = function() {
    this.flushStdout(true);
    this.flushStderr(true);

    return this.allOutputs;
}

CommandLine.Command = function(cmd, workingDir) {
    this.origCmd = cmd;
    var splitted = CommandLine._splitCmd(cmd);
    this.cmd = splitted.cmd;
    this.args = splitted.args;
    this.cwd = workingDir;
    this.promise = new Promise();
    this.stdout = [];
    this.stderr = [];
}

CommandLine.Command.prototype.run = function() {
    log("Running commend: " + this.origCmd + " in a working dir: " + this.cwd);
    CommandLine._run(this.promise, this.cmd, this.args, this.cwd);
}

module.exports = CommandLine;