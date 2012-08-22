define(['require'
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

        function loadHome() {
            $('#hero').show();
            $('#info_header').show();
            $('#info').show();
            $('#screenshots').show();

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
            session.createSession(route.match[1]);

            $('#main-container').hide();
            $('#outer-container').show();
            $('.editor_buttons').fadeIn('slow');

            $('#nav').fadeIn('slow');

            require(['app/app'], function(App) {
                App.instance.load();
            });
        }

        var homeRegexp = new RegExp(basepath.getPath() + '$');
        var idRegExp = new RegExp('.*' + basepath.getPath() + '(.*)#?$');

        Spine.Route.add(homeRegexp, loadHome);
        Spine.Route.add(idRegExp, loadDippa);

        Spine.Route.setup({history: true});

        $(function() {
            $('.carousel').carousel();
        });
    });