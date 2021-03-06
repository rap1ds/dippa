console.log('settings requirejs confs');
require.config({
    shim: {
        'spine/spine': {
            exports: 'Spine'
        },
        'spine/manager': {
            deps: ['spine/spine']
        },
        'spine/route': {
            deps: ['jquery', 'spine/spine']
        },
        'handlebars': {
            exports: 'Handlebars'
        },
	'typo': {
	    exports: 'Typo'
	},
        'jquery.iframe-transport': ['jquery'],
        'jquery.fileupload': ['jquery'],
        'jquery.fileupload-ui': ['jquery'],
        'underscore': {
            exports: '_'
        }
    },
    paths: {
        'jquery.ui.widget': 'jquery-ui'
    },
    waitSeconds: 15
});

require(['require'
    , 'jquery'
    , 'bootstrap-carousel'
    , 'spine/spine'
    , 'spine/route'
    , 'app/basepath'
    , 'app/controller/hero'
    , 'app/controller/demo-button'
    , 'app/session']

    , function(require
        , $
        , bootstrapCarousel
        , Spine
        , SpineRoute
        , basepath
        , Hero
        , DemoButton
        , session) {

        "use strict";

        $(function() {

            console.log('main.js');

            function loadHome() {
                $('#hero').show();
                $('#info_header').show();
                $('#info').show();
                $('#screenshots').show();
                $('#whos-using').show();
                $('#what-said').show();
                $('#contact').show();

                $("#letter-link").click(function() {
                    // No idea if this really helps, but let's try...
                    debugger;
                    var rev =  ["m", "o", "c", ".", 
                        "r", "o", "t", "i", "d", 
                        "e", "a", "p", "p", "i", 
                        "d", "@", "o", "k", "k",
                        "i", "m", ":", "o", "t", 
                        "l", "i", "a", "m"];
                    var loc = rev.reverse().join("");
                    location.href = loc;
                });

                $('#step2').css('opacity', 0.25).find('p').hide();
                $('#step3').css('opacity', 0.25).find('p').hide();
                $('#step4').css('opacity', 0.25).find('p').hide();

                $('#editor_container').hide();
                $('.editor_buttons').fadeOut('slow');

                $('#main-container').show();
                $('#outer-container').hide();

                $('#github_ribbon').show();

                $('#nav').fadeOut('slow');
            }

            function loadDippa(route) {
                $('#main-container').hide();
                $('#outer-container').show();
                $('.editor_buttons').fadeIn('slow');

                $('#nav').fadeIn('slow');

                require(['app/app'], function(app) {
                    app.loadModules(route.match[1]);
                });
            }

            var homeRegexp = new RegExp(basepath.getPath() + '$');
            var idRegExp = new RegExp('.*' + basepath.getPath() + '(.*)#?$');

            Spine.Route.add(homeRegexp, loadHome);
            Spine.Route.add(idRegExp, loadDippa);

            Spine.Route.setup({history: true});

            $('.carousel').carousel();
        });
    });