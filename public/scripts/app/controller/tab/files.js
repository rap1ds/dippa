define(['app/controller/tab/tab'], function(Tab) {
    "use strict";

    console.log('app/controller/tab/files.js');

    var FilesTab = Tab.sub({
        el: '#tab_files',
        click: function() {
            this.stack.controllerStack.files.active();
            this.stack.files.active();
        }
    });

    return FilesTab;
});