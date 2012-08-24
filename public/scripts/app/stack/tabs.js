define(['spine/spine'
    , 'app/controller/tab/document'
    , 'app/controller/tab/references'
    , 'app/controller/tab/files'
    , 'app/controller/tab/output'],

    function(Spine, DocumentTab, ReferencesTab, FilesTab, OutputTab) {

        console.log('app/stack/tabs.js');

        "use strict";

        function getControllers() {
            return {
                doc: DocumentTab,
                ref: ReferencesTab,
                files: FilesTab,
                output: OutputTab
            }
        }

        var TabStack = Spine.Stack.sub({
            el: '#nav',

            init: function() {
                this.controllers = getControllers();
            },

            'default': 'doc',

            fadeIn: function() {
                this.el.fadeIn('slow');
            },

            fadeOut: function() {
                this.el.fadeOut('slow');
            }
        });

        return TabStack;
    });