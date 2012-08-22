define(['app/controller/tab/tab'], function(Tab) {
    "use strict";

    var FilesTab = Tab.sub({
        el: '#tab_files',
        click: function() {
            this.stack.controllerStack.files.active();
            this.stack.files.active();
        }
    });

    return FilesTab;
});