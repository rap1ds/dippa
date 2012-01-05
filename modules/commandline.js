var spawn = require('child_process').spawn;
var p = require('node-promise');
var when = p.when;
var Promise = p.Promise;

var CommandLine = {

    _splitCmd: function(cmd) {
        var cmdParts = cmd.split(' ');

        var command = cmdParts.shift();

        for(var i = 0; i < cmdParts.length; i++) {
            cmdParts[i] = cmdParts[i].replace(/%%/g, ' ');
        }

        return {cmd: command, args: cmdParts};
    },

    _run: function(promise, cmd, args, workingDir) {
        var spawnOperation = spawn(cmd, args, {cwd: workingDir});

        spawnOperation.on('exit', function() {
            promise.resolve();
        });
        spawnOperation.stdout.on('data', function (data) {
            console.log('STDOUT: ' + data.toString('utf-8'));
        });

        spawnOperation.stderr.on('data', function (data) {
            console.log('STDERR: ' + data.toString('utf-8'));
        });
    },

    runAll: function(commands) {
        var promise = new Promise();

        function runCommand() {
            var commandToRun = commands.shift();

            if(commandToRun) {
                commandToRun.promise.then(function() {
                    runCommand();
                });
                commandToRun.run();
            } else {
                promise.resolve();
            }
        }

        runCommand();

        return promise;
    }
}

CommandLine.Command = function(cmd, workingDir) {
    var splitted = CommandLine._splitCmd(cmd);
    this.cmd = splitted.cmd;
    this.args = splitted.args;
    this.cwd = workingDir;
    this.promise = new Promise();
}

CommandLine.Command.prototype.run = function() {
    CommandLine._run(this.promise, this.cmd, this.args, this.cwd);
}

module.exports = CommandLine;