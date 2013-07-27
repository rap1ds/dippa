var CommandLine = require('../modules/commandline');

describe('CommandLine', function() {
    "use strict";

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
        });
    });

    describe('Output', function() {
        it('should combine the spawn output and split it on line break', function() {
            var output = new CommandLine.Output();

            output.stdout("\n(/usr/local/texlive/2011/texmf-dist/tex/latex/base/inputenc.sty");
            output.stdout("\n(/usr/local/texlive/2011/texmf-dist/tex/latex/base/utf8.def");
            output.stdout("\n(/usr/local/texlive/2011/texmf-dist/tex/latex/base/t1enc.dfu");
            output.stdout(")");
            output.stdout("\n(/usr/local/texlive/2011/texmf-dist/tex/latex/base/ot1enc.dfu");
            output.stdout(")");
            output.stdout("\n(/usr/local/texlive/2011/texmf-dist/tex/latex/base/omsenc.dfu");
            output.stdout(")");
            output.stdout(")");
            output.stdout(")");
            output.stdout("\n(/usr/local/texlive/2011/texmf-dist/tex/latex/base/fontenc.sty");
            output.stdout("\n(/usr/local/texlive/2011/texmf-dist/tex/latex/base/t1enc.def)");
            output.stdout(")");
            output.stdout("\n(/usr/local/texlive/2011/texmf-dist/tex/generic/babel/babel.sty");
            output.stdout("\n(/usr/local/texlive/2011/texmf-dist/tex/generic/babel/finnish.ldf");
            output.stdout("\n(/usr/local/texlive/2011/texmf-dist/tex/generic/babel/babel.def");
            output.stdout(")");
            output.stdout(")");
            output.stdout(")");
            output.stderr("Everything up-to-date");

            expect(output.getOutput()).toEqual([
                {type: "stdout", output: ""},
                {type: "stdout", output: "(/usr/local/texlive/2011/texmf-dist/tex/latex/base/inputenc.sty"},
                {type: "stdout", output: "(/usr/local/texlive/2011/texmf-dist/tex/latex/base/utf8.def"},
                {type: "stdout", output: "(/usr/local/texlive/2011/texmf-dist/tex/latex/base/t1enc.dfu)"},
                {type: "stdout", output: "(/usr/local/texlive/2011/texmf-dist/tex/latex/base/ot1enc.dfu)"},
                {type: "stdout", output: "(/usr/local/texlive/2011/texmf-dist/tex/latex/base/omsenc.dfu)))"},
                {type: "stdout", output: "(/usr/local/texlive/2011/texmf-dist/tex/latex/base/fontenc.sty"},
                {type: "stdout", output: "(/usr/local/texlive/2011/texmf-dist/tex/latex/base/t1enc.def))"},
                {type: "stdout", output: "(/usr/local/texlive/2011/texmf-dist/tex/generic/babel/babel.sty"},
                {type: "stdout", output: "(/usr/local/texlive/2011/texmf-dist/tex/generic/babel/finnish.ldf"},
                {type: "stdout", output: "(/usr/local/texlive/2011/texmf-dist/tex/generic/babel/babel.def)))"},
                {type: "stderr", output: "Everything up-to-date"}
            ]);
        });
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
        });

        it('should not split arguments if the whitespace is escaped', function() {
            var splitted = CommandLine._splitCmd("git commit -a -m 'A%%commit%%message%%whit%%white%%spaces'");

            expect(splitted.cmd).toEqual('git');
            expect(splitted.args).toEqual(['commit', '-a', '-m', '\'A commit message whit white spaces\'']);
        });

        it('should not split arguments if they are inside double quotes', function() {

        });
    });

    describe('runAll', function() {
        var c1, c2, c3, c1output, c2output, c3output;

        beforeEach(function() {
            c1 = new CommandLine.Command('git push -u origin master', '../');
            c2 = new CommandLine.Command('date');
            c3 = new CommandLine.Command('ssh git@github.com');

            c1output = [{type: "stderr", output: "nothing to push"}, {type: "stdout", output: "push ok"}];
            c2output = [{type: "stdout", output: "Monday"}];
            c3output = [{type: "stdout", output: "Type your password"}];

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

                c1.promise.resolve(c1output);
            });

            waits(0);

            runs(function() {
                expect(c2.run).toHaveBeenCalled();
                expect(c3.run).not.toHaveBeenCalled();
                expect(promise.resolve).not.toHaveBeenCalled();

                c2.promise.resolve(c2output);
            });

            waits(0);

            runs(function() {
                expect(c3.run).toHaveBeenCalled();
                expect(promise.resolve).not.toHaveBeenCalled();

                c3.promise.resolve(c3output);
            });

            waits(0);

            runs(function() {
                expect(promise.resolve).toHaveBeenCalledWith([
                    {type: "stderr", output: "nothing to push"},
                    {type: "stdout", output: "push ok"},
                    {type: "stdout", output: "Monday"},
                    {type: "stdout", output: "Type your password"}
                ]);
            });
        });
    });
});