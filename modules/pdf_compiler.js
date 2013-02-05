var Promise = require("promised-io/promise").Promise;
var commandline = require('../modules/commandline');
var Command = commandline.Command;

var processes = {};

function compile(repoDir) {
		debugger;
		console.log('Compiling PDF', repoDir);
		processes[repoDir] = true;
        var compilePromise = new Promise();

        var remove = new Command('rm dippa.pdf', repoDir);

        var pdflatex1 = new Command('pdflatex --interaction=nonstopmode --jobname=tmp dippa', repoDir);
        var bibtex1 = new Command('bibtex dippa', repoDir);
        var pdflatex2 = new Command('pdflatex --interaction=nonstopmode --jobname=tmp dippa', repoDir);
        var bibtex2 = new Command('bibtex dippa', repoDir);
        var pdflatex3 = new Command('pdflatex --interaction=nonstopmode --jobname=tmp dippa', repoDir);

        var copy = new Command('mv tmp.pdf dippa.pdf', repoDir);

        commandline.runAll([remove, pdflatex1, bibtex1, pdflatex2, bibtex2, pdflatex3, copy]).then(function(output) {
            console.log('Compiling done', repoDir);
            processes[repoDir] = false;
            compilePromise.resolve(output);
        });

        return compilePromise;
}

function isCompiling(repoDir) {
	return !!processes[repoDir];
}

module.exports = Object.freeze({
	compile: compile,
	isCompiling: isCompiling
});

console.log('PDF compiler initialized');