define(['require', 'jquery'], function(require, $) {
    "use strict";

    function onChange(callback) {
        var editor = require('app/controller/editor').instance;

        editor.onChange(callback);
    }

    var exports = Object.freeze({
        onChange: onChange
    })
});
