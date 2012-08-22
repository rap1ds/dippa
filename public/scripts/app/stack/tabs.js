define([
    'spine/spine',
    'spine/manager',
    'app/controller/tab/document',
    'app/controller/tab/references',
    'app/controller/tab/files',
    'app/controller/tab/output'],

    function(Spine, SpineManager, DocumentTab, ReferencesTab, FilesTab, OutputTab) {

        "use strict";

        var TabStack = Spine.Stack.sub({
            el: '#nav',

            controllers: {
                doc: DocumentTab,
                ref: ReferencesTab,
                files: FilesTab,
                output: OutputTab
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