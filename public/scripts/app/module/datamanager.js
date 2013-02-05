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

        function setSaveButtonToSavingState() {
            var saveButton = require('app/controller/save-button');
            saveButton.startSaving();
        }

        function prepareConsoleToSaving() {
            var console = require('app/module/console');
            console.clear();
            console.println('Saving and compiling document');
            console.println();
            console.println('Please wait a moment...');
        }

        function setSaveButtonToCompleteState() {
            var saveButton = require('app/controller/save-button');
            saveButton.endSaving();
        }

        function setResponseToConsole(response) {
            var console = require('app/module/console');
            console.clear();

            response.forEach(function(value) {
                console.println(value.output);
            });
        }

        function beforeSave() {
            var document = require('app/module/document');
            document.flush();

            setSaveButtonToSavingState();
            prepareConsoleToSaving();

            var editor = require('app/controller/editor').instance;
            editor.getSession().removeListener('change', updateSaveButtonState);
        }

        function afterSave(response) {
            setSaveButtonToCompleteState();
            setEditorChangedToFalse();
            setResponseToConsole(response);

            var editor = require('app/controller/editor').instance;
            editor.getSession().on('change', updateSaveButtonState);

            var document = require('app/module/document');

            updateSaveButton(document.hasChanged());
        }

        function updateSaveButton(changed) {
            var saveButton = require('app/controller/save-button');

            saveButton.setChanged(changed);
        }

        function updateSaveButtonState() {
            var document = require('app/module/document');

            updateSaveButton(document.hasChanged());
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

        function updateDocumentContent(value) {
            var document = require('app/module/document');

            var editor = require('app/controller/editor').instance;
            var value = editor.getValue();

            if (activeDocument === 'document') {
                document.setDocumentContent(value);
            }

            if(activeDocument === 'references') {
                document.setReferenceContent(value);
            }
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

        function load() {
            // Implement
            var editor = require('app/controller/editor').instance;

            editor.getSession().on('change', updateDocumentContent);
            editor.getSession().on('change', updateSaveButtonState);
        }

        var exports = Object.freeze({
            load: load,
            save: save,
            setActiveDocument: setActiveDocument,
            onEditorCursorChange: onEditorCursorChange
        });

        return exports;
    }
);