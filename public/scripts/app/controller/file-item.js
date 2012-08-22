define(['jquery', 'spine/spine', 'handlebars', 'app/controller/file-preview', 'app/session'], function($, Spine, Handlebars, FilePreview, session) {
    "use strict";

    var FileItem = Spine.Controller.sub({

        // Delegate the click event to a local handler
        events: {
            "click .preview-file": "preview",
            "click .remove-file": "remove"
        },

        tag: 'li',

        // Bind events to the record
        init: function() {
            if ( !this.item ) throw "@item required";
            this.item.bind("update", this.proxy(this.render));
            this.item.bind("destroy", this.proxy(this.removeEl));
        },

        render: function(item){
            if (item) this.item = item;

            this.html(FileItem.template(this.item));
            return this;
        },

        removeEl: function() {
            this.el.remove();
        },

        // Called after an element is destroyed
        remove: function(){
            $.ajax({
                type: 'DELETE',
                url: 'upload/' + session.sessionId + '/' + this.item.filename,
                success: this.proxy(function() {
                    this.item.destroy();
                })
            });
        },

        preview: function() {
            FilePreview.instance.previewFile(this.item);
        },

        click: function(){

        }
    }, {
        template: Handlebars.compile($("#filelistitem-template").html())
    });

    return {
        class: FileItem
    }

});