define(['jquery', 'spine/spine', 'handlebars', 'app/controller/editor'], function($, Spine, Handlebars, Editor) {

    window.onbeforeunload = function (e) {

        if(!Editor.instance.hasChanged()) {
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