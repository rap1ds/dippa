define(['jquery', 'spine/spine'], function($, Spine) {
    "use strict";

    var FilesView = Spine.Controller.sub({
        activate: function() {
            $('#files').show();
        },

        deactivate: function() {
            $('#files').hide();
        }
    });

    return FilesView;

});