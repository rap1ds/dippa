define(['require'], function(require) {
    "use strict";

    function createCursorPositionState() {
        var position = {row: 0, column: 0};

        var exports = Object.freeze({
            setPosition: function(value) {
                position = value;
            },
            getPosition: function() {
                return position;
            }
        });

        return exports;
    }

    var documentCursorPosition = createCursorPositionState();
    var referenceCursorPosition = createCursorPositionState();

    var exports = Object.freeze({
        setDocumentCursorPosition: documentCursorPosition.setPosition,
        getDocumentCursorPosition: documentCursorPosition.getPosition,
        setReferenceCursorPosition: referenceCursorPosition.setPosition,
        getReferenceCursorPosition: referenceCursorPosition.getPosition
    });

    return exports;
});