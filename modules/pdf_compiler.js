var Promise = require("promised-io/promise").Promise;
var commandline = require('../modules/commandline');
var Command = commandline.Command;

var processes = {};


function ignoreLatexmkRunLog() {
    var ignoreNext = false;
    return function(output) {
        if(ignoreNext) {
            ignoreNext = false;
            return false;
        } else {
            var isLatexMkLog = output.output === 'Latexmk: Run number 1 of rule \'pdflatex\'';
            ignoreNext = isLatexMkLog;
            return !isLatexMkLog;
        }
    };
}

function compile(repoDir) {
		console.log('Compiling PDF', repoDir);
		processes[repoDir] = true;
        var compilePromise = new Promise();

        var remove = new Command('rm dippa.pdf', repoDir);
        var latexmk = new Command('latexmk -silent -pdf -r ../../../latexmkrc -jobname=tmp dippa', repoDir);
        var copy = new Command('cp tmp.pdf dippa.pdf', repoDir);

        commandline.runAll([remove, latexmk, copy]).then(function(output) {
            output = output.filter(ignoreLatexmkRunLog());
            console.log(output);
            console.log('Compiling done', repoDir);
            processes[repoDir] = false;
            compilePromise.resolve(output);
        }, function(e) {
            console.log('Compile failed');
            console.error(e);
        });

        return compilePromise;
}

function isCompiling(repoDir) {
	return !!processes[repoDir];
}

module.exports = {
	compile: compile,
	isCompiling: isCompiling
};

console.log('PDF compiler initialized');