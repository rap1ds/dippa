define(['jquery', 'spine/spine'], function($, Spine) {
    "use strict";

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