define(['spine/spine'], function(Spine) {
    "use strict";

    console.log('app/controller/tab/tab.js');

    var Tab = Spine.Controller.sub({
        proxied: ['click'],
        events: {
            'click': 'click'
        }
    });

    return Tab;
});