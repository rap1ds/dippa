define(['jquery', 'spine/spine'], function($, Spine) {
    "use strict";

    console.log('app/controller/output-view.js');

    var OutputView = Spine.Controller.sub({

        activate: function() {
            $('#console').show();
        },

        deactivate: function() {
            $('#console').hide();
        }
    });

    return OutputView;
});