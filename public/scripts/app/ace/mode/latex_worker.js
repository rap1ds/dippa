define('ace/mode/latex_worker', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/worker/mirror'], function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var Mirror = require("../worker/mirror").Mirror;

    var LatexWorker = exports.LatexWorker = function(sender) {
        Mirror.call(this, sender);
        this.setTimeout(200);
    };

    oop.inherits(LatexWorker, Mirror);

    (function() {

        this.onUpdate = function() {
            var value = this.doc.getValue();

            var lines = value.split('\n');
            var len = lines.length;
            var outline = [];

            var findSections = /\\((?:sub)*)section\*?\{(.*)\}|\\part\*?\{(.*)\}|\\chapter\*?\{(.*)\}/g;

            var minLevel = null;
            for(var i = 0; i < len; i++) {
                var line = lines[i];
                var result;
                while ((result = findSections.exec(line)) != null)
                {
                    var section = {};

                    if(result[1] == null) {
                        var orig = result[0];

                        if(orig.match(/\\part\*?\{(.*)\}/)) {
                            section.level = 0;
                            section.title = result[3];
                        }

                        if(orig.match(/\\chapter\*?\{(.*)\}/)) {
                            section.level = 1;
                            section.title = result[4];
                        }
                    } else {
                        // (sub)section
                        section.title = result[2];
                        section.level = (result[1].length / 3) + 2; // 'sub'.length === 3
                    }

                    section.line = i + 1;

                    // Update min level
                    minLevel = minLevel === null ? section.level : Math.min(minLevel, section.level);

                    outline.push(section);
                }
            }

            // Fix levels
            if(minLevel > 0) {
                for(var j = 0, outlineLen = outline.length; j < outlineLen; j++) {
                    outline[j].level -= minLevel;
                }
            }

            this.sender.emit("outline", outline);
        };

    }).call(LatexWorker.prototype);
});