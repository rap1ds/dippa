define(['jquery', 'app/controller/editor'], function($) {
    "use strict";
    
    var container = $('#find-container');
    var findButton = $('#find-button', container);
    var closeButton = $('#close-find', container);
    var findInput = $('#find-input', container);

    function show(editor) {
        container.show();
        findInput.focus();
    }

    function close() {
        container.hide();
    }

    function keydown(event) {
        var ESC = 27;

        if (event.which == ESC) {
            close();
        }
    }

    function find() {
        var editor = require('app/controller/editor').instance.editor;
        console.log('FIND', findInput.val());
        editor.find(findInput.val());
    }

    // Bind listeners
    $(function() {
        closeButton.click(close);
        findButton.click(find);
        findInput.keydown(keydown);
    });

    return Object.freeze({
        show: show
    });
});
