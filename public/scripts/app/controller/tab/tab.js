define(['spine/spine'], function(Spine) {
    var Tab = Spine.Controller.sub({
        proxied: ['click'],
        events: {
            'click': 'click'
        }
    });

    return Tab;
});