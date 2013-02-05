define(function() {
    "use strict";

    function createHandler(startTag, endTag) {
        return function(editor) {
            var range = editor.getSelectionRange();
            var start = range.start;
            var end = range.end;

            if(start.column === end.column && start.row === end.row) {
                editor.insert(startTag + endTag);
                editor.navigateLeft(1);
            } else {
                // Change the end cursor column position by the number of added chars if the start and end
                // are on the same line
                var endColumn = start.row === end.row ? end.column + startTag.length : end.column;

                editor.clearSelection();
                editor.moveCursorTo(start.row, start.column);
                editor.insert(startTag);
                editor.moveCursorTo(end.row, endColumn);
                editor.insert(endTag);
            }
        }
    };

    function init(editor) {
        editor.commands.addCommand({
            name: 'bold',
            bindKey: {
                win: 'Ctrl-B',
                mac: 'Command-B',
                sender: 'editor'
            },
            exec: createHandler('\\textbf{', '}')
        });

        editor.commands.addCommand({
            name: 'italic',
            bindKey: {
                win: 'Ctrl-I',
                mac: 'Command-I',
                sender: 'editor'
            },
            exec: createHandler('\\textit{', '}')
        });

        editor.commands.addCommand({
            name: 'underline',
            bindKey: {
                win: 'Ctrl-U',
                mac: 'Command-U',
                sender: 'editor'
            },
            exec: createHandler('\\underline{', '}')
        });
    }

    return init;
});