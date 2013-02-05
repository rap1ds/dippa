console.log('Loading file app/controller/editor.js');

define(['require'
    , 'spine/spine'
    , 'app/controller/outline'
    , 'app/controller/editor_format_keybindings'
    , 'app/controller/spellcheck-button'
    , 'app/module/tex-analyzer'],

    function(require, Spine, Outline, editorFormatKeybindinds) {

        "use strict";

        console.log('Defining module app/controller/editor.js');
        var mode;

        var Editor = Spine.Controller.sub({

            init: function() {

            },

            initializeEditor: function() {
                this.editor = ace.edit('editor');
                this.session = this.editor.getSession();
                var LatexMode = ace.require("ace/mode/latex").Mode;
                mode = new LatexMode();
                this.session.setMode(mode);
                
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
                        var datamanager = require('app/module/datamanager');
                        datamanager.save();
                    }
                });

                editorFormatKeybindinds(this.editor);

                this.session.on('change', this.proxy(function() {
                    Spine.trigger('change');
                    this.setChanged(true);
                }));

                var session = this.session;

                this.session.on('parsed', function(parsed) {
                    var texAnalyzer = require('app/module/tex-analyzer');
                    var outline = texAnalyzer.outline(parsed);
                    Outline.update(outline);
                });
            },

            onChange: function(callback) {
                this.session.on('change', function() {
                    callback(this.getValue());
                }.bind(this));
            },

            onCursorChange: function(callback) {
                this.session.selection.on('changeCursor', function(e) {
                    callback(this.editor.getCursorPosition());
                }.bind(this));
            },

            getSession: function() {
                return this.session;
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

            gotoLine: function(lineNumber) {
                this.editor.gotoLine(lineNumber);
            },

            enableSpellchecking: function (enable) {
                mode.enableSpellChecking(enable, this.session.getDocument());
                this.editor.resize(true);
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
