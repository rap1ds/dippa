define(['jquery', 'spine/spine', 'app/controller/hero', 'app/basepath'], function($, Spine, Hero, basepath) {
    "use strict";

    console.log('app/controller/demo-button.js');

    var DemoButton = Spine.Controller.sub({
        el: $('#demo_button'),

        events: {
            'click': 'click'
        },

        init: function() { },

        click: function() {
            $('#info').fadeOut();
            $('#screenshots').fadeOut();
            $('#github_ribbon').fadeOut();
            Hero.instance.el.fadeOut(function() {
                $('#loader').show();
                $.ajax({
                    url: 'create',
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify({isDemo: true}),
                    error: function(err) {
                        // FIXME
                    },
                    complete: function(response) {
                        var id = response.responseText;

                        Spine.Route.navigate(basepath.getPath() + id);
                        $('#loader').hide();
                        $('#outer-container').show();
                        $('#editor_container').show('slow');
                    }
                });
            });
        }
    });

    return new DemoButton();
});