define(['jquery'], function($) {
    "use strict";

    console.log('app/controller/preview-button.js');

    function create(selector, url) {
        $(selector).click(function() {
            window.open(url, '_newtab');
        });
    }

    return create;

});