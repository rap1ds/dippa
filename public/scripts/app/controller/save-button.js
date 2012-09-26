define(['require'
    , 'jquery'
    , 'underscore'
    , 'app/module/datamanager'],

    function(require, $, _, datamanager) {

        "use strict";

        $('#save_button').click(function() {
            var datamanager = require('app/module/datamanager');
            datamanager.save();
        });

        var savingState = (function() {
            var clbk = _.identity;
            var isSaving = false;

            return Object.freeze({
                setSaving: function(newSavingStatus) {
                    debugger;
                    newSavingStatus = !!newSavingStatus;
                    if(isSaving === newSavingStatus) {
                        // Nothing changed
                        return;
                    }

                    isSaving = newSavingStatus;

                    if(!isSaving) {
                        clbk();
                        clbk = _.identity;
                    }
                },
                run: function(fn) {
                    if(!isSaving) {
                        // Run immediately, if not saving
                        fn();
                    } else {
                        // Run when saving complete
                        clbk = fn;
                    }
                }
            });
        })();

        function disable(el) {
            el.addClass('disabled');
            el.attr('disabled', 'disabled');
        }

        function enable(el) {
            el.removeClass('disabled');
            el.removeAttr('disabled');
        }

        function startSaving(el) {
            el.button('saving');
            disable(el);

            savingState.setSaving(true);
        }

        function endSaving(el) {
            el.button('complete');
            disable(el);

            _.delay(function() {
                el.button('reset');
                savingState.setSaving(false);
            }, 3000);
        }

        function setChanged(el, changed) {
            if(changed) {
                savingState.run(enable.bind(null, el));
            } else {
                savingState.run(disable.bind(null, el));
            }
        }

        var exports = (function() {
            var $button = $('#save_button');

            return Object.freeze({
                startSaving: startSaving.bind(null, $button),
                endSaving: endSaving.bind(null, $button),
                setChanged: setChanged.bind(null, $button)
            });
        })();

        return exports;
    });