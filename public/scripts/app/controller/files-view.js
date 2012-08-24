define(['jquery', 'spine/spine'], function($, Spine) {
    "use strict";

    console.log('app/controller/files-view.js');

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