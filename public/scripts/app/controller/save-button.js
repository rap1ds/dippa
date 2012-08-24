define(['jquery', 'spine/spine', 'app/controller/editor', 'app/controller/preview-button', 'app/session'], function($, Spine, Editor, PreviewButton, session) {
    "use strict";

    console.log('app/utils/save-button.js');

    var SaveButton = Spine.Controller.sub({
        el: $('#save_button'),
        state: "disabled",

        events: {
            'click': 'save'
        },

        init: function() {
            Spine.bind('change', this.proxy(this.documentChanged));
            Spine.bind('initialLoading', this.proxy(this.initialLoading));
        },

        initialLoading: function() {
            this.initialLoadingDone = true;
            this.stateDisable();
        },

        documentChanged: function() {
            this.changed = true;
            if(this.initialLoadingDone && this.state === "disabled") {
                this.stateEnable();
            }
        },

        /**
         * Enables button. This happens when document is changed
         */
        stateEnable: function() {
            this.state = "enabled";
            this.changed = false;
            this.el.button('enable');

            // Enable button
            this.enabled = true;
            this.el.removeClass('disabled');
            this.el.removeAttr('disabled');
        },

        /**
         * Resets buttons state to the default (disabled) state
         */
        stateDisable: function() {
            this.state = "disabled";
            this.el.button('reset');
            this.disableButton();
        },

        /**
         * Changes text to saving text
         */
        stateSaving: function() {
            this.changed = false;
            this.state = "saving";
            this.el.button('saving');
            this.disableButton();
        },

        /**
         * Changes text to "complete" for some seconds
         */
        stateComplete: function(timeout) {
            this.state = "complete";
            timeout = timeout || 1000;

            this.el.button('complete');
            this.disableButton();

            _.delay(function() {
                if(this.changed) {
                    this.stateEnable();
                } else {
                    this.stateDisable();
                }
            }.bind(this), timeout);
        },

        disableButton: function() {
            this.enabled = false;
            this.el.addClass('disabled');
            this.el.attr('disabled', 'disabled');
        },

        save: function() {
            var $saveButton = $(this);
            var $previewButton = $('#preview_button');

            this.stateSaving();
            PreviewButton.instance.buttonLoading();

            $('#console').empty();
            $('#console').append('<span>Saving and compiling document</span><br />');
            $('#console').append('<span></span><br />');
            $('#console').append('<span>Please wait a moment...</span><br />');

            this.sendRequest();
        },

        sendRequest: function() {
            Editor.instance.updateContent();

            var value = JSON.stringify({documentContent: Editor.instance.docContent.value, referencesContent: Editor.instance.refContent.value});

            $.ajax({
                type: "POST",
                url: 'save/' + session.sessionId,
                dataType: 'json',
                contentType: 'application/json',
                data: value,
                processData: false,
                complete: this.proxy(function(response) {
                    this.stateComplete();
                    PreviewButton.instance.buttonReset();
                    Editor.instance.setChanged(false);
                }),
                success: this.proxy(function(response) {
                    var $console = $('#console');
                    $console.empty();
                    $.each(response, function(key, value) {
                        $console.append('<span>' + value.output + '</span><br />');
                    });
                })
            });
        }
    });

    return {
        class: SaveButton,
        instance: new SaveButton
    }

});