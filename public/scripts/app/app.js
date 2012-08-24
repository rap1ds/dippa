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
    , 'app/controller/save-button'
    , 'app/controller/preview-button'
    , 'bootstrap-buttons'
    , 'bootstrap-transition'
    , 'app/controller/outline'
    , 'app/controller/window'
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
        , Editor) {

        console.log('app/app.js');

        var App = Spine.Controller.sub({

            init: function(){
                // Init controllers
                this.filesController = new Files();
                this.controllers = new ControllersStack();
                this.tabStack = new TabStack({controllerStack: this.controllers});

                // Initialize sub editors
                Editor.instance.initializeEditor();

                // Init routes
                // var homeRegexp = new RegExp(basepath.getPath() + '$');
                // Spine.Route.add(homeRegexp, this.proxy(this.home));
                // var idRegExp = new RegExp('.*' + basepath.getPath() + '(.*)#?$');
                // Spine.Route.add(idRegExp, this.proxy(this.loadId));
            },

            load: function() {
                $.ajax({
                    url: 'load/' + session.sessionId,
                    dataType: 'json',
                    success: function(content) {
                        var editor = Editor.instance;
                        var file = File.class;

                        editor.docContent = new Content({type: 'doc', value: content.documentContent});
                        editor.refContent = new Content({type: 'ref', value: content.referencesContent});

                        file.loadFromServer(session.sessionId);
                        editor.changeType('doc');
                        editor.setChanged(false);
                        Spine.trigger('initialLoading');

                        $('#fileupload').fileupload({
                            autoUpload: true,
                            url: basepath.getPath() + 'upload/' + session.sessionId,
                            done: function(e, data) {
                                data.result.forEach(function(filename) {
                                    File.class.create(filename);
                                });
                            }
                        });
                    }
                });
                $('#editor_container').show();
            }
        });

        return {
            class: App,
            instance: new App()
        };

    });