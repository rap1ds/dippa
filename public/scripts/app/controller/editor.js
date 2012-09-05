console.log('Loading file app/controller/editor.js');

define(['require'
    , 'spine/spine'
    , 'app/controller/outline'],

    function(require, Spine, Outline, SaveButton) {

    "use strict";

    console.log('Defining module app/controller/editor.js');

    var Editor = Spine.Controller.sub({

        init: function() {

        },

        initializeEditor: function() {
            this.editor = ace.edit('editor');
            this.session = this.editor.getSession();
            var LatexMode = ace.require("ace/mode/latex").Mode;

            this.session.setMode(new LatexMode());
            this.session.setUseWrapMode(true);
            this.editor.setShowPrintMargin(false);

            this.changed = false;

            this.editor.commands.addCommand({
                name: 'save',
                bindKey: {
                    win: 'Ctrl-S',
                    mac: 'Command-S',
                    sender: 'editor'
                },
                exec: function(env, args, request) {
                    var saveButton = require('app/controller/save-button').instance;
                    saveButton.save();
                }
            });

            this.session.on('change', this.proxy(function() {
                debugger;
                Spine.trigger('change');
                this.setChanged(true);
            }));

            this.session.on('outline', function(outline) {
                Outline.update(outline);
            });
        },

        getValue: function() {
            return this.session.getValue();
        },

        setValue: function(value) {
            this.session.setValue(value);
        },

        setChanged: function(value) {
            this.changed = value;
        },

        hasChanged: function() {
            return this.changed;
        },

        changeType: function(type) {
            if(type === 'doc') {
                this.setContent(this.docContent);
            } else if (type === 'ref') {
                this.setContent(this.refContent);
            } else {
                throw "Illegal type " + type;
            }
        },

        gotoLine: function(lineNumber) {
            this.editor.gotoLine(lineNumber);
        },

        setContent: function(newContent) {
            if(this.content === newContent) {
                return;
            }

            // Update value
            this.updateContent();
            this.content = newContent;
            this.setValue(this.content.value);

            // Set cursor
            if(this.content.cursor) {
                this.setCursorPosition(this.content.cursor);
            }
        },

        updateContent: function() {
            if(!this.content) {
                return;
            }

            this.content.value = this.getValue();
            this.content.cursor = this.getCursorPosition();
        },

        setCursorPosition: function(pos) {
            this.editor.moveCursorToPosition(pos);
        },

        getCursorPosition: function() {
            return this.editor.getCursorPosition();
        }
    });

    return {
        class: Editor,
        instance: new Editor()
    };
});