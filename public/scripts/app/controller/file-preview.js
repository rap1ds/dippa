define(['jquery', 'spine/spine', 'app/session'], function($, Spine, session) {
    "use strict";

    console.log('app/controller/file-preview.js');

    var FilePreview = Spine.Controller.sub({
        el: $('#file-preview'),

        proxied: ['clearPreview'],

        elements: {
            '#preview-empty': 'empty',
            '#preview-iframe': 'iframe',
            '#preview-image': 'image'
        },

        init: function() {

        },

        previewFile: function(item) {
            var previewPath = 'repositories/' + session.sessionId + '/',
                isPDF = item.filename.match(/\.pdf$/),
                target = isPDF ? this.iframe : this.image,
                toBeHidden = isPDF ? this.image : this.iframe;

            this.bindListeners(item);
            this.empty.hide();

            target.attr('src', previewPath + item.filename).show();
            toBeHidden.hide();
        },

        bindListeners: function(item) {
            if(this.currentItem) {
                this.currentItem.unbind("destroy", this.clearPreview);
            }

            this.currentItem = item;

            if(this.currentItem) {
                item.bind("destroy", this.proxy(this.clearPreview));
            }
        },

        clearPreview: function() {
            this.bindListeners(null);
            this.image.hide();
            this.iframe.hide();
            this.empty.show();
        }

    });

    return {
        class: FilePreview,
        instance: new FilePreview()
    };
});