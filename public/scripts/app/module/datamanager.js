define(['require'
    , 'jquery'
    , 'app/module/ajax'
    , 'app/session'
    , 'app/module/console'
    , 'app/module/document'
    , 'app/module/cursor'],

    function(require, $, ajax, session, console, document, cursor) {

    "use strict";

    var activeDocument = 'document'; // values: document, references

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

    function getEditorContent() {
        var document = require('app/module/document');

        return JSON.stringify({
            documentContent: document.getDocumentContent(),
            referencesContent: document.getReferenceContent()
        });
    }

    function onEditorCursorChange(value) {
        var cursor = require('app/module/cursor');

        if (activeDocument === 'document') {
            cursor.setDocumentCursorPosition(value);
        }

        if(activeDocument === 'references') {
            cursor.setReferenceCursorPosition(value);
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

    function setActiveDocument(value) {
        if(value !== 'document' && value !== 'references') {
            throw 'Illegal active document value ' + value;
        }

        activeDocument = value;

        var cursor = require('app/module/cursor');
        var document = require('app/module/document');
        var editor = require('app/controller/editor').instance;

        if (activeDocument === 'document') {
            var documentCursorPos = cursor.getDocumentCursorPosition();
            editor.setValue(document.getDocumentContent());
            editor.setCursorPosition(documentCursorPos);
        }

        if(activeDocument === 'references') {
            var referenceCursorPos = cursor.getReferenceCursorPosition();
            editor.setValue(document.getReferenceContent());
            editor.setCursorPosition(referenceCursorPos);
        }
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
        setActiveDocument: setActiveDocument,
        onEditorCursorChange: onEditorCursorChange
    });

    return exports;
}
);