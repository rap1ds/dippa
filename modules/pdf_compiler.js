var Promise = require("promised-io/promise").Promise;
var commandline = require('../modules/commandline');
var Command = commandline.Command;

var processes = {};

function compile(repoDir) {
		console.log('Compiling PDF', repoDir);
		processes[repoDir] = true;
        var compilePromise = new Promise();

        var remove = new Command('rm dippa.pdf', repoDir);
        var latexmk = new Command('latexmk -pdf -silent -e \'$pdflatex_silent_switch="-interaction=nonstopmode"\' -jobname=tmp dippa', repoDir);
        var copy = new Command('cp tmp.pdf dippa.pdf', repoDir);

        commandline.runAll([remove, latexmk, copy]).then(function(output) {
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