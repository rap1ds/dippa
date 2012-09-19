define(['app/controller/tab/tab', 'app/controller/editor'], function(Tab, Editor) {
    "use strict";

    console.log('app/controller/tab/references.js');

    var ReferencesTab = Tab.sub({
        el: '#tab_ref',
        click: function() {
            var datamanager = require('app/module/datamanager');
            datamanager.setActiveDocument('references');
            Editor.instance.changeType('ref');
            this.stack.controllerStack.doc.active();
            this.stack.ref.active();
        }
    });

    return ReferencesTab;
});