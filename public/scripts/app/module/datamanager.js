define(['require', 'jquery', 'app/module/ajax', 'app/session', 'app/module/console', 'app/module/document'], function(require, $, ajax, session) {
    "use strict";

    var activeDocument = 'document'; // values: document, references

    function getEditorContent() {
        var editor = require('app/controller/editor').instance;
        editor.updateContent();

        return JSON.stringify({documentContent: editor.docContent.value, referencesContent: editor.refContent.value});
    }

    function setEditorChangedToFalse() {
        var editor = require('app/controller/editor').instance;
        editor.setChanged(false);
    }

    function setPreviewButtonToSavingState() {
        var previewButton = require('app/controller/preview-button').instance;
        previewButton.buttonLoading();
    }

    function setSaveButtonToSavingState() {
        var saveButton = require('app/controller/save-button').instance;
        saveButton.stateSaving();
    }

    function prepareConsoleToSaving() {
        var console = require('app/module/console');
        console.clear();
        console.println('Saving and compiling document');
        console.println();
        console.println('Please wait a moment...');
    }

    function setPreviewButtonToIdleState() {
        var previewButton = require('app/controller/preview-button').instance;
        previewButton.buttonReset();
    }

    function setSaveButtonToCompleteState() {
        var saveButton = require('app/controller/save-button').instance;
        saveButton.stateComplete();
    }

    function setResponseToConsole(response) {
        var console = require('app/module/console');
        console.clear();

        response.forEach(function(value) {
            console.println(value.output);
        });
    }

    function beforeSave() {
        setPreviewButtonToSavingState();
        setSaveButtonToSavingState();
        prepareConsoleToSaving();
    }

    function afterSave(response) {
        setPreviewButtonToIdleState();
        setSaveButtonToCompleteState();
        setEditorChangedToFalse();
        setResponseToConsole(response);
        var document = require('app/module/document');
        document.flush();
    }

    function updateSaveButton(changed) {
        var saveButton = require('app/controller/save-button').instance;

        if(changed) {
            saveButton.stateEnable();
        } else {
            saveButton.stateDisable();
        }
    }

    function setEditorContent(value) {
        var document = require('app/module/document');

        if (activeDocument === 'document') {
            document.setDocumentContent(value);
        }

        if(activeDocument === 'references') {
            document.setReferenceContent(value);
        }

        updateSaveButton(document.hasChanged());
    }

    function save() {
        beforeSave();

        var value = getEditorContent();
        var id = session.sessionId;

        var deferred = ajax.save(id, value)
            .done(afterSave);

        return deferred;
    }

    var exports = Object.freeze({
        save: save,
        setEditorContent: setEditorContent,
        setActiveDocument: function(value) {
            if(value !== 'document' && value !== 'references') {
                throw 'Illegal active document value ' + value;
            }

            activeDocument = value;
        }
    });

    return exports;
});