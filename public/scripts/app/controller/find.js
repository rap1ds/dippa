define(['jquery', 'app/controller/editor'], function($) {
    "use strict";
    
    var container = $('#find-container');
    var findButton = $('#find-button', container);
    var closeButton = $('#close-find', container);
    var findInput = $('#find-input', container);
    var findForm = $('#find-form', container);

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
        editor.find(findInput.val());
    }

    function submit(e) {
        find();
        e.preventDefault();
    }

    // Bind listeners
    $(function() {
        closeButton.click(close);
        findButton.click(find);
        findInput.keydown(keydown);
        findForm.submit(submit);
    });

    return Object.freeze({
        show: show
    });
});
