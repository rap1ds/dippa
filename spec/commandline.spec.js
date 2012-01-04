var CommandLine = require('../modules/commandline')

describe('CommandLine', function() {

    describe('command', function() {
        it('should be defined', function() {
            expect(CommandLine.Command).toBeDefined();
        });

        it('should create a new Command object', function() {
            var c = new CommandLine.Command("git push -u origin master", "../");

            expect(c.cmd).toEqual("git");
            expect(c.args).toEqual(['push', '-u', 'origin', 'master']);
            expect(c.cwd).toEqual("../");
            expect(c.promise.then).toBeDefined();
        });

        it('should run the command with promise', function() {
            spyOn(CommandLine, '_run');

            var c = new CommandLine.Command("git push -u origin master", "../");
            c.run();
            expect(CommandLine._run).toHaveBeenCalledWith(c.promise, 'git', ['push', '-u', 'origin', 'master'], '../');
        })
    });

    describe('_splitCmd', function() {

        it('should be defined', function() {
            expect(CommandLine._splitCmd).toBeDefined();
        });

        it('should split command to command and an array of arguments', function() {
            var splitted = CommandLine._splitCmd('git push -u origin master');

            expect(splitted.cmd).toEqual('git');
            expect(splitted.args).toEqual(['push', '-u', 'origin', 'master']);
        });

        it('should split command even if it has no arguments', function() {
            var splitted = CommandLine._splitCmd('ssh');

            expect(splitted.cmd).toEqual('ssh');
            expect(splitted.args).toEqual([]);
        })
    });

    describe('runAll', function() {
        var c1, c2, c3;

        beforeEach(function() {
            c1 = new CommandLine.Command('git push -u origin master', '../');
            c2 = new CommandLine.Command('date');
            c3 = new CommandLine.Command('ssh git@github.com');

            spyOn(c1, 'run');
            spyOn(c2, 'run');
            spyOn(c3, 'run');
        });

        it('should be defined', function() {
            expect(CommandLine.runAll).toBeDefined();
        });

        it('should run commands in sequence and notify promise when all done', function() {
            var promise = CommandLine.runAll([c1, c2, c3]);
            spyOn(promise, 'resolve');

            runs(function() {
                expect(c1.run).toHaveBeenCalled();
                expect(c2.run).not.toHaveBeenCalled();
                expect(c3.run).not.toHaveBeenCalled();
                expect(promise.resolve).not.toHaveBeenCalled();

                c1.promise.resolve();
            });

            waits(0);

            runs(function() {
                expect(c2.run).toHaveBeenCalled();
                expect(c3.run).not.toHaveBeenCalled();
                expect(promise.resolve).not.toHaveBeenCalled();

                c2.promise.resolve();
            });

            waits(0);

            runs(function() {
                expect(c3.run).toHaveBeenCalled();
                expect(promise.resolve).not.toHaveBeenCalled();

                c3.promise.resolve();
            });

            waits(0);

            runs(function() {
                expect(promise.resolve).toHaveBeenCalled();
            });
        });
    })
});