define(['require', 'jquery', 'spine/spine', 'handlebars'], function(require, $, Spine, Handlebars) {

    console.log('app/controller/outline.js');

    var OutlineItem = Spine.Controller.sub({
        events: {"click": "goto"},

        tag: 'li',

        init: function() {},

        render: function(item) {
            if (item) this.item = item;

            // Indent
            var level = this.item.level || 0;
            var indent = (10 * level) + 'px;';
            this.item.indent = indent;

            this.html(OutlineItem.template(this.item));

            return this;
        },

        goto: function() {
            var lineNumber = this.item.line || null;

            if(lineNumber != null) {
                // Ugly handle circular reference
                require(['app/controller/editor'], function(Editor) {
                    Editor.instance.gotoLine(lineNumber);
                });
            }
        }
    }, {
        template: Handlebars.compile($("#outlinelistitem-template").html())
    });

    var Outline = Spine.Controller.create({
        el: $('#outline_list'),

        init: function() {

        },

        update: function(outline) {
            this.el.empty();
            this.el.append('<li class="nav-header">Document outline</li>');
            outline.forEach(function(item) {
                var outlineItem = new OutlineItem({item: item});
                this.append(outlineItem.render());
            }.bind(this));
        }


    });

    return new Outline();
});