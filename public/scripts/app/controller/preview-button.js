define(['jquery', 'spine/spine', 'app/app', 'app/controller/editor', 'app/session'], function($, Spine, App, Editor, session) {
    "use strict";

    console.log('app/controller/preview-button.js');

    var PreviewButton = Spine.Controller.create({
        el: $('#preview_button'),

        events: {
            'click': 'click'
        },

        buttonLoading: function() {
            this.el.button('loading');
        },

        buttonReset: function() {
            this.el.button('reset');
        },

        click: function() {
            window.open('repositories/' + session.sessionId + '/dippa.pdf', '_newtab');
        }

    });

    return {
        class: PreviewButton,
        instance: new PreviewButton()
    }

});