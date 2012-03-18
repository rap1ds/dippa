(function(global) {
    var Hero = Spine.Controller.sub({

        el: $('#hero'),
        events: {
            'click #create_dippa': 'createDippa',
            'click #step1_done': 'step1Done',
            'click #step2_done': 'step2Done',
            'click #step3_done': 'step3Done'
        },
        elements: {
            '#github_instructions': 'instructions',
            '#step1': 'step1',
            '#step2': 'step2',
            '#step3': 'step3',
            '#repository_url': 'repositoryUrl',
            '#repository_url_container': 'repositoryUrlContainer',
            '#admin_link': 'adminLink'
        },
        proxied: ['createRequest'],

        createDippa: function() {
            console.log('Dippa create clicked');
            this.instructions.slideDown();
            $('#info').fadeOut();
            $('#info_header').fadeOut();
        },

        step1Done: function() {
            this.inactivate(this.step1);
            this.activate(this.step2);
        },

        step2Done: function() {
            this.repositoryInfo = Dippa.Github.parseRepositoryUrl(this.repositoryUrl.val());

            if(!this.repositoryInfo) {
                this.repositoryUrlContainer.addClass('error');
                return;
            }

            this.repositoryUrlContainer.removeClass('error').addClass('success');

            this.adminLink.attr('href',
                'https://github.com/' + this.repositoryInfo.owner + '/' +
                    this.repositoryInfo.name + '/admin/collaboration');

            this.inactivate(this.step2);
            this.activate(this.step3)
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

        step3Done: function() {
            this.hideInstructions(this.proxy(function() {
                $('#loader').show();
                this.createRequest();
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
                data: JSON.stringify({repo: this.repositoryInfo}),
                error: function(err) {
                    // FIXME
                },
                complete: function(response) {
                    var id = response.responseText;

                    Spine.Route.navigate(Dippa.basepath + id);
                    $('#loader').hide();
                    $('#editor_container').show('slow');
                }
            });
        }

    }).init();

    var PreviewButton = Spine.Controller.create({
        el: $('#preview_button'),

        buttonLoading: function() {
            this.el.button('loading');
        },

        buttonReset: function() {
            this.el.button('reset');
        },

        click: function() {
            window.open('repositories/' + Dippa.id + '/dippa.pdf', '_newtab');
        }

    }).init();

    var SaveButton = Spine.Controller.create({
        el: $('#save_button'),

        events: {
            'click': 'save'
        },

        buttonLoading: function() {
            this.el.button('loading');
        },

        buttonReset: function() {
            this.el.button('reset');
        },

        save: function() {
            var $saveButton = $(this);
            var $previewButton = $('#preview_button');

            this.buttonLoading();
            PreviewButton.buttonLoading();

            $('#console').empty();
            $('#console').append('<span>Saving and compiling document</span><br />');
            $('#console').append('<span></span><br />');
            $('#console').append('<span>Please wait a moment...</span><br />');

            this.sendRequest();
        },

        sendRequest: function() {
            // Update doc/refContent
            if(Dippa.mode === "doc") {
                Dippa.docContent = Editor.getValue();
            }
            if(Dippa.mode === "ref") {
                Dippa.refContent = Editor.getValue();
            }

            var value = JSON.stringify({documentContent: Dippa.docContent, referencesContent: Dippa.refContent});

            $.ajax({
                type: "POST",
                url: 'save/' + Dippa.id,
                dataType: 'json',
                contentType: 'application/json',
                data: value,
                processData: false,
                complete: this.proxy(function(response) {
                    this.buttonReset();
                    PreviewButton.buttonReset();
                    changed = false;
                }),
                success: this.proxy(function(response) {
                    $console = $('#console');
                    $console.empty();
                    $.each(response, function(key, value) {
                        $console.append('<span>' + value.output + '</span><br />');
                    })
                })
            });
        }

    }).init();

    var Editor = Spine.Controller.create({

        init: function() {
            this.editor = ace.edit('editor');
            this.session = this.editor.getSession();
            var LatexMode = require("ace/mode/latex").Mode;

            this.session.setMode(new LatexMode());
            this.session.setUseWrapMode(true);
            this.editor.setShowPrintMargin(false);

            this.changed = false;

            this.editor.commands.addCommand({
                name: 'save',
                bindKey: {
                    win: 'Ctrl-S',
                    mac: 'Command-S',
                    sender: 'editor'
                },
                exec: function(env, args, request) {
                    SaveButton.save();
                }
            });

            this.session.on('change', this.proxy(function() {
                this.setChanged(true);
            }));
        },

        getValue: function() {
            return this.session.getValue();
        },

        setValue: function(value) {
            this.session.setValue(value);
        },

        setChanged: function(value) {
            this.changed = value;
        },

        hasChanged: function() {
            return this.changed;
        }

    }).init();

    var FilePreview = Spine.Controller.create({
        el: $('#file-preview'),

        proxied: ['clearPreview'],

        elements: {
            '#preview-empty': 'empty',
            '#preview-iframe': 'iframe',
            '#preview-image': 'image'
        },

        init: function() {

        },

        previewFile: function(item) {
            var previewPath = 'repositories/' + Dippa.id + '/',
                isPDF = item.filename.match(/\.pdf$/),
                target = isPDF ? this.iframe : this.image,
                toBeHidden = isPDF ? this.image : this.iframe;

            this.bindListeners(item);
            this.empty.hide();

            target.attr('src', previewPath + item.filename).show();
            toBeHidden.hide();
        },

        bindListeners: function(item) {
            if(this.currentItem) {
                this.currentItem.unbind("destroy", this.clearPreview);
            }

            this.currentItem = item;

            if(this.currentItem) {
                item.bind("destroy", this.proxy(this.clearPreview));
            }
        },

        clearPreview: function() {
            this.bindListeners(null);
            this.image.hide();
            this.iframe.hide();
            this.empty.show();
        }

    }).init();

    var FileItem = Spine.Controller.sub({

        // Delegate the click event to a local handler
        events: {
            "click .preview-file": "preview",
            "click .remove-file": "remove"
        },

        tag: 'li',

        // Bind events to the record
        init: function() {
            if ( !this.item ) throw "@item required";
            this.item.bind("update", this.proxy(this.render));
            this.item.bind("destroy", this.proxy(this.removeEl));
        },

        render: function(item){
            if (item) this.item = item;

            this.html(FileItem.template(this.item));
            return this;
        },

        removeEl: function() {
            this.el.remove();
        },

        // Called after an element is destroyed
        remove: function(){
            $.ajax({
                type: 'DELETE',
                url: 'upload/' + Dippa.id + '/' + this.item.filename,
                success: this.proxy(function() {
                    this.item.destroy();
                })
            });
        },

        preview: function() {
            FilePreview.previewFile(this.item);
        },

        click: function(){

        }
    }, {
        template: Handlebars.compile($("#filelistitem-template").html())
    });

    var Files = Spine.Controller.sub({
        el: $('#filelist'),

        init: function(){
            Dippa.File.bind("refresh", this.proxy(this.addAll));
            Dippa.File.bind("create",  this.proxy(this.addOne));
        },

        addOne: function(item){
            var file = new FileItem({item: item});
            this.append(file.render());
        },

        addAll: function(){
            Dippa.File.each(this.proxy(this.addOne));
        }
    });


    var EditorView = Spine.Controller.sub({
        activate: function() {
            $('#editor').show();
        },

        deactivate: function() {
            debugger;
            $('#editor').hide();
        }
    });

    var OutputView = Spine.Controller.sub({

        activate: function() {
            $('#console').show();
        },

        deactivate: function() {
            $('#console').hide();
        }
    });

    var FilesView = Spine.Controller.sub({
        activate: function() {
            $('#files').show();
        },

        deactivate: function() {
            $('#files').hide();
        }
    });

    var ControllerStack = Spine.Stack.sub({
        controllers: {
            doc: EditorView,
            output: OutputView,
            files: FilesView
        }
    });

    var Tab = Spine.Controller.sub({
        proxied: ['click'],
        events: {
            'click': 'click'
        }
    });

    var DocumentTab = Tab.sub({
        el: '#tab_doc',
        click: function() {
            Dippa.setMode("doc");
            this.stack.controllerStack.doc.active();
            this.stack.doc.active();
        }
    });

    var ReferencesTab = Tab.sub({
        el: '#tab_ref',
        click: function() {
            Dippa.setMode("ref");
            this.stack.controllerStack.doc.active();
            this.stack.ref.active();
        }
    });

    var OutputTab = Tab.sub({
        el: '#tab_out',
        click: function() {
            this.stack.controllerStack.output.active();
            this.stack.output.active();
        }
    });

    var FilesTab = Tab.sub({
        el: '#tab_files',
        click: function() {
            this.stack.controllerStack.files.active();
            this.stack.files.active();
        }
    });

    var TabStack = Spine.Stack.sub({
        el: '#nav',
        controllers: {
            doc: DocumentTab,
            ref: ReferencesTab,
            files: FilesTab,
            output: OutputTab
        },
    default: 'doc',
        fadeIn: function() {
        this.el.fadeIn('slow');
    }
});

global.Hero = Hero;
global.PreviewButton = PreviewButton;
global.SaveButton = SaveButton;
global.Editor = Editor;
global.FilePreview = FilePreview;
global.FileItem = FileItem;
global.Files = Files;
global.TabStack = TabStack;
global.ControllerStack = ControllerStack;

})(Dippa)