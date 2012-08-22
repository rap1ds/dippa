define(['app/controller/tab/tab', 'app/controller/editor'], function(Tab, Editor) {
    "use strict";

    var ReferencesTab = Tab.sub({
        el: '#tab_ref',
        click: function() {
            Editor.instance.changeType('ref');
            this.stack.controllerStack.doc.active();
            this.stack.ref.active();
        }
    });

    return ReferencesTab;
});