define(['underscore'], function(underscore) {
    "use strict";

    function outline(parsed) {
        var levels = [
            "part",
            "chapter",
            "section",
            "subsection",
            "subsubsection",
            "subsubsubsection"
        ];

        debugger;

        var minLevel = null;

        return _.chain(parsed.elements)
            .filter(function(element) {
                if(!element.command) {
                    return false;
                }

                return _.contains(levels, element.command.name);
            })
            .map(function(element) {

                function cleanupTitle(title) {
                    title = title.slice(1, -1);
                    title = title.replace(/\\n/g, "");
                    return title;
                }

                var level = _.indexOf(levels, element.command.name);

                // Update min level
                minLevel = minLevel === null ? level : Math.min(minLevel, level);

                return {
                    level: level,
                    title: cleanupTitle(element.command.args),
                    line: element.command.line
                };
            })
            .map(function(section) {
                if(minLevel > 0) {
                    section.level -= minLevel;
                }
                return section;
            }).value();
    }

    return Object.freeze({
        outline: outline
    });
});
