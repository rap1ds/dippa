define(['jquery', 'spine/spine'], function($, Spine) {
    "use strict";

    var File = Spine.Model.sub();
    File.configure('File', 'filename');

    File.extend({
        loadFromServer: function(id) {
            $.ajax({
                type: "GET",
                url: 'uploads/' + id,
                dataType: 'json',
                contentType: 'application/json',
                success: function(response) {
                    if(!Array.isArray(response)) {
                        return;
                    }

                    response.forEach(function(filename) {
                        File.create({filename: filename});
                    });
                }
            });
        }
    });

    return {
        class: File,
        instance: new File()
    };
});