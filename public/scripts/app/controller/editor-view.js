define(['jquery', 'spine/spine'], function($, Spine) {
    "use strict";

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