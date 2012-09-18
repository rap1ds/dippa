define(['jquery'], function($) {
    "use strict";

    function save(id, value) {
         var deferred = $.ajax({
            type: "POST",
            url: 'save/' + id,
            dataType: 'json',
            contentType: 'application/json',
            data: value,
            processData: false,
        });

        return deferred;
    }

    var exports = Object.freeze({
        save: save
    });

    return exports;
})