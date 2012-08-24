define(['spine/spine', 'app/model/file', 'app/controller/file-item'], function(Spine, File, FileItem) {

    console.log('app/controller/files.js');

    var Files = Spine.Controller.sub({
        el: $('#filelist'),

        init: function(){
            File.class.bind("refresh", this.proxy(this.addAll));
            File.class.bind("create",  this.proxy(this.addOne));
        },

        addOne: function(item){
            var file = new FileItem.class({item: item});
            this.append(file.render());
        },

        addAll: function(){
            File.class.each(this.proxy(this.addOne));
        }
    });

    return Files;
});