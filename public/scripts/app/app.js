console.log('Loading file app/app.js');

define(['jquery'
    , 'spine/spine'
    , 'app/controller/files'
    , 'app/stack/controllers'
    , 'app/stack/tabs'
    , 'app/model/content'
    , 'app/model/file'
    , 'app/basepath'
    , 'app/session'
    , 'app/controller/editor'
    , 'app/module/datamanager'
    , 'app/controller/preview-button'
    , 'bootstrap-buttons'
    , 'bootstrap-transition'
    , 'bootstrap-dropdown'
    , 'app/controller/outline'
    , 'jquery.fileupload'
    ],

    function($
        , Spine
        , Files
        , ControllersStack
        , TabStack
        , Content
        , File
        , basepath
        , session
        , Editor
        , datamanager
        , previewButton) {

        console.log('Defining module app/app.js');

        var App = Spine.Controller.sub({

            init: function(){
                // Init controllers
                this.filesController = new Files();
                this.controllers = new ControllersStack();
                this.tabStack = new TabStack({controllerStack: this.controllers});

                // Initialize sub editors
                Editor.instance.initializeEditor();
                Editor.instance.onCursorChange(datamanager.onEditorCursorChange);
            },

            load: function(id) {
                debugger;
                datamanager.load();
                $.ajax({
                    url: 'load/' + id,
                    dataType: 'json',
                    success: function(content) {
                        var documentOpts = content.document;
                        var previewId = documentOpts.previewId;

                        session.createSession(id, previewId);

                        var editor = Editor.instance;
                        var file = File.class;

                        file.loadFromServer(session.sessionId);

                        var document = require('app/module/document');
                        document.setDocumentContent(content.documentContent);
                        document.setReferenceContent(content.referencesContent);
                        document.flush();

                        previewButton('#preview_button', 'preview/' + previewId);

                        datamanager.setActiveDocument('document');
                        editor.setValue(document.getDocumentContent());

                        var saveButton = require('app/controller/save-button');
                        saveButton.setChanged(false);

                        $('#fileupload').fileupload({
                            autoUpload: true,
                            url: basepath.getPath() + 'upload/' + session.sessionId,
                            done: function(e, data) {
                                JSON.parse(data.result).forEach(function(filename) {
                                    File.class.create(filename);
                                });
                            }
                        });
                    }
                });
                $('#editor_container').show();
            }
        });

        function loadModules(id) {
            // Load other modules
            require(['app/controller/window', 'app/controller/save-button'], function() {
                exports.instance.load(id);
            });
        }

        var exports = {
            class: App,
            instance: new App(),
            loadModules: loadModules
        };

        return exports;
    });