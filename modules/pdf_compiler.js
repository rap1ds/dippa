var Promise = require("promised-io/promise").Promise;
var commandline = require('../modules/commandline');
var Command = commandline.Command;
var log = require('../modules/log');

var processes = {};


function ignoreLatexmkRunLog() {
    "use strict";
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
    "use strict";
		log('Compiling PDF', repoDir);
		processes[repoDir] = true;
        var compilePromise = new Promise();

        var remove = new Command('rm dippa.pdf', repoDir);
        var latexmk = new Command('latexmk -silent -pdf -r ../../../latexmkrc -jobname=tmp dippa', repoDir);
        var copy = new Command('cp tmp.pdf dippa.pdf', repoDir);

        commandline.runAll([remove, latexmk, copy]).then(function(output) {
            output = output.filter(ignoreLatexmkRunLog());
            log(output);
            log('Compiling done', repoDir);
            processes[repoDir] = false;
            compilePromise.resolve(output);
        }, function(e) {
            log.error('Compile failed');
            log.error(e);
        });

        return compilePromise;
}

function isCompiling(repoDir) {
    "use strict";
	return !!processes[repoDir];
}

module.exports = {
	compile: compile,
	isCompiling: isCompiling
};

log('PDF compiler initialized');