define(function() {
    "use strict";

    console.log('app/basepath.js');

    function getPath() {
        return window.location.hostname.indexOf('futupeople') !== -1 ? '/dippa/' : '/';
    }

    return Object.freeze({
        getPath: getPath
    });
});