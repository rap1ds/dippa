define(['require'
    , 'jquery'
    , 'underscore'
    , 'spine/spine'
    , 'app/controller/editor'
    , 'app/controller/preview-button'
    , 'app/session'
    , 'app/module/ajax'],

    function(require, $, _, Spine, Editor, PreviewButton, session, ajax) {

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
                var editor = require('app/controller/editor').instance;
                editor.updateContent();

                var value = JSON.stringify({documentContent: editor.docContent.value, referencesContent: editor.refContent.value});

                var controller = this;

                ajax.save(session.sessionId, value).done(function(response) {
                    controller.stateComplete();
                    PreviewButton.instance.buttonReset();
                    editor.setChanged(false);
                    var $console = $('#console');
                    $console.empty();
                    $.each(response, function(key, value) {
                        $console.append('<span>' + value.output + '</span><br />');
                    });
                });
            }
        });

        return {
            class: SaveButton,
            instance: new SaveButton
        }

    });