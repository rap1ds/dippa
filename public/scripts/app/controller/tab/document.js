define(['app/controller/tab/tab', 'app/controller/editor'], function(Tab, Editor) {
    "use strict";

    console.log('app/controller/tab/document.js');

    var DocumentTab = Tab.sub({
        el: '#tab_doc',
        click: function() {
            Editor.instance.changeType('doc');
            this.stack.controllerStack.doc.active();
            this.stack.doc.active();
        }
    });

    return DocumentTab;
});