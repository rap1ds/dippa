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
        , datamanager) {

        console.log('Defining module app/app.js');

        var App = Spine.Controller.sub({

            init: function(){
                // Init controllers
                this.filesController = new Files();
                this.controllers = new ControllersStack();
                this.tabStack = new TabStack({controllerStack: this.controllers});

                // Initialize sub editors
                Editor.instance.initializeEditor();
                Editor.instance.onChange(datamanager.setEditorContent);
            },

            load: function() {
                $.ajax({
                    url: 'load/' + session.sessionId,
                    dataType: 'json',
                    success: function(content) {
                        var editor = Editor.instance;
                        var file = File.class;

                        file.loadFromServer(session.sessionId);

                        var document = require('app/module/document');
                        document.setDocumentContent(content.documentContent);
                        document.setReferenceContent(content.referencesContent);
                        document.flush();

                        datamanager.setActiveDocument('document');
                        editor.setValue(document.getDocumentContent());

                        var saveButton = require('app/controller/save-button').instance;
                        saveButton.stateDisable();

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

        var exports = {
            class: App,
            instance: new App()
        };

        // Load other modules
        require(['app/controller/window', 'app/controller/save-button'], function() {
            exports.instance.load();
        });

        return exports;

    });