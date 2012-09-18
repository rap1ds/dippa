define(['require', 'jquery'], function(require, $) {
    "use strict";

    function clear($console) {
        $console.empty();
    }

    function println($console, line) {
        $console.append('<span>' + (line || '') + '</span><br />');
    }

    var exports = Object.freeze({
        clear: clear.bind(null, $('#console')),
        println: println.bind(null, $('#console'))
    });

    return exports;
});