var commandLine = require('../modules/commandline');
var git = require('../modules/git');

describe('git.js', function() {

    describe('git commands', function() {
        it('add()', function(){
            var cmd = git.add('dippa.tex', '/users/mikko/dippa');

            expect(cmd.origCmd).toEqual('git add dippa.tex');
            expect(cmd.cwd).toEqual('/users/mikko/dippa');
        });

        it('commit()', function(){
            var cmd = git.commit('Update', '/users/mikko/dippa');

            expect(cmd.origCmd).toEqual('git commit --all --message="Update"');
            expect(cmd.cwd).toEqual('/users/mikko/dippa');
        });

        it('pull()', function() {

            var cmd = git.pull('/users/mikko/dippa');

            expect(cmd.origCmd).toEqual('git pull --rebase');
            expect(cmd.cwd).toEqual('/users/mikko/dippa');
        });

        it('push()', function() {
            var cmd = git.push('/users/mikko/dippa');

            expect(cmd.origCmd).toEqual('git push');
            expect(cmd.cwd).toEqual('/users/mikko/dippa');
        });
    });

    describe('git actions', function() {

        var runAll;

        beforeEach(function() {
            runAll = spyOn(commandLine, 'runAll');
        });

        it('pushChanges()', function() {
            git.pushChanges('/users/mikko/dippa');

            var commands = runAll.mostRecentCall.args[0];

            expect(commands[0].origCmd).toEqual('git add dippa.tex');
            expect(commands[1].origCmd).toEqual('git add ref.bib');
            expect(commands[2].origCmd).toEqual('git commit --all --message="Update"');
            expect(commands[3].origCmd).toEqual('git pull --rebase');
            expect(commands[4].origCmd).toEqual('git push');

            commands.forEach(function(command) {
                expect(command.cwd).toEqual('/users/mikko/dippa');
            });
        });

        /*

        var commitMessage = "Update";
                    var addtex = new Command('git add dippa.tex', repoDir);
                    var addref = new Command('git add ref.bib', repoDir);
                    var commit = new Command('git commit --all --message="' + commitMessage + '"', repoDir);
                    var pull = new Command('git pull', repoDir);
                    var push = new Command('git push', repoDir);

                    commandline.runAll([addtex, addref, commit, pull, push]).then(function(allOutputs) {
                        // Log all Git output
                        (allOutputs || []).forEach(function(output) {
                            output = output || {};
                            log(output.type + ": " + output.value);
                        });
                    });

         */

    });

});