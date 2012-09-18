define(['require'
    , 'jquery'
    , 'underscore'
    , 'spine/spine'
    , 'app/controller/editor'
    , 'app/controller/preview-button'
    , 'app/session'
    , 'app/module/ajax'
    , 'app/module/datamanager'],

    function(require, $, _, Spine, Editor, PreviewButton, session, ajax, datamanager) {

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
                datamanager.save();
            }
        });

        return {
            class: SaveButton,
            instance: new SaveButton
        }

    });