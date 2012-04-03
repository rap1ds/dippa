(function(global) {

    var File = Spine.Model.sub();
    File.configure('File', 'filename');

    File.extend({
        loadFromServer: function() {
            $.ajax({
                type: "GET",
                url: 'uploads/' + global.id,
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

    var Content = Spine.Model.sub();
    Content.configure('Content', 'value', 'type', 'cursor');

    global.File = File;
    global.Content = Content;



})(typeof Dippa !== 'undefined' ? Dippa : module.exports);