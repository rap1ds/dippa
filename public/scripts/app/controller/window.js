define(['require'], function(require) {

    console.log('app/controller/window.js');

    window.onbeforeunload = function (e) {
        var document = require('app/module/document');

        if(!document.hasChanged()) {
            return;
        }

        e = e || window.event;

        // For IE and Firefox prior to version 4
        if (e) {
            e.returnValue = 'You have unsaved changes.';
        }

        // For Safari
        return 'You have unsaved changes.';
    };

});