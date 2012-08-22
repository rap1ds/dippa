define(function() {
    "use strict";

    function getPath() {
        return window.location.hostname.indexOf('futupeople') !== -1 ? '/dippa/' : '/';
    }

    return Object.freeze({
        getPath: getPath
    });
});