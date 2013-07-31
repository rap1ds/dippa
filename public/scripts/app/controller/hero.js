define(['jquery', 'spine/spine', 'app/basepath', 'app/session', 'app/utils/github'], function($, Spine, basepath, session, Github) {
    "use strict";

    console.log('app/controller/hero.js');

    var Hero = Spine.Controller.sub({

        el: $('#hero'),
        events: {
            'click #create_dippa': 'createDippa',
            'click #step1_done': 'step1Done',
            'click #step2_done': 'step2Done',
            'click #step3_done': 'step3Done',
            'click #step4_done': 'step4Done'
        },
        elements: {
            '#github_instructions': 'instructions',
            '#step1': 'step1',
            '#step2': 'step2',
            '#step3': 'step3',
            '#step4': 'step4',
            '#repository_url': 'repositoryUrl',
            '#repository_url_container': 'repositoryUrlContainer',
            '#admin_link': 'adminLink',
            '#template_list': 'templateList'
        },
        proxied: ['createRequest'],

        createDippa: function() {
            this.instructions.slideDown();
            $('#screenshots').fadeOut();
            $('#info').fadeOut();
            $('#whos-using').fadeOut();
            $('#what-said').fadeOut();
            $('#github_ribbon').fadeOut();
            $('#contact').fadeOut();
        },

        step1Done: function() {
            _gaq.push(['_trackEvent', 'Create Dippa', 'Step 1 done']);
            this.inactivate(this.step1);
            this.activate(this.step2);
        },

        step2Done: function() {
            _gaq.push(['_trackEvent', 'Create Dippa', 'Step 2 done']);
            this.repositoryInfo = Github.parseRepositoryUrl(this.repositoryUrl.val());

            if(!this.repositoryInfo) {
                _gaq.push(['_trackEvent', 'Create Dippa', 'Step 2 repository error']);
                this.repositoryUrlContainer.addClass('error');
                return;
            }

            this.repositoryUrlContainer.removeClass('error').addClass('success');

            this.adminLink.attr('href',
                'https://github.com/' + this.repositoryInfo.owner + '/' +
                    this.repositoryInfo.name + '/admin/collaboration');

            this.inactivate(this.step2);
            this.activate(this.step3);
        },

        step3Done: function() {
            _gaq.push(['_trackEvent', 'Create Dippa', 'Step 3 done']);
            this.inactivate(this.step3);
            this.activate(this.step4);
        },

        step4Done: function() {
            _gaq.push(['_trackEvent', 'Create Dippa', 'Step 4 done']);
            this.template = this.templateList.val();
            this.hideInstructions(this.proxy(function() {
                $('#loader').show();
                this.createRequest();
            }));
        },

        hideInstructions: function(callback) {
            this.instructions.slideUp(this.proxy(function() {
                var oldOffset = this.el.offset();
                var $temp = this.el.clone().appendTo('body');
                $temp.css('position', 'absolute')
                    .css('left', oldOffset.left)
                    .css('width', '820px')
                    .css('top', oldOffset.top)
                    .css('marginTop', 0)
                    .css('zIndex', 1000);
                this.el.hide();

                $temp.animate({
                    left: '-940'
                }, function() {
                    callback();
                });
            }));
        },

        activate: function(el) {
            el.animate({opacity: 1});
            el.find('p').slideDown();
        },

        inactivate: function(el) {
            el.animate({opacity: 0.25});
            el.find('p').slideUp();
        },

        createRequest: function() {
            $.ajax({
                url: 'create',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({repo: this.repositoryInfo, template: this.template}),
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
        }
    });

    return {
        class: Hero,
        instance: new Hero()
    };
});
