define([
    'spine/spine',
    'spine/manager',
    'app/controller/editor-view',
    'app/controller/output-view',
    'app/controller/files-view'],

    function(
        Spine,
        SpineManager,
        EditorView,
        OutputView,
        FilesView) {

        "use strict";

        console.log('app/stack/controllers.js');

        var ControllersStack = Spine.Stack.sub({
            controllers: {
                doc: EditorView,
                output: OutputView,
                files: FilesView
            }
        });

        return ControllersStack;
    });