var spawn = require('child_process').spawn;
var p = require('node-promise');
var when = p.when;
var Promise = p.Promise;

var CommandLine = {

    _splitCmd: function(cmd) {
        var cmdParts = cmd.split(' ');

        return {cmd: cmdParts.shift(), args: cmdParts};
    },

    _run: function(promise, cmd, args, workingDir) {
        var spawnOperation = spawn(cmd, args, workingDir);

        var output;
        spawnOperation.on('exit', function() {
            promise.resolve(output);
        });
        spawnOperation.stdout.on('data', function (data) {
            output = data.toString('utf-8');
            console.log(output);
        });

        spawnOperation.stderr.on('data', function (data) {
            promise.reject(data);
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