define(['jquery', 'spine/spine'], function($, Spine) {
    "use strict";

    console.log('app/controller/editor-view.js');

    var EditorView = Spine.Controller.sub({
        activate: function() {
            $('#editor').show();
        },

        deactivate: function() {
            $('#editor').hide();
        }
    });

    return EditorView;
});