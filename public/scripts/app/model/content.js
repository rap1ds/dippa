define(['jquery', 'spine/spine'], function($, Spine) {
    "use strict";

    console.log('app/model/content.js');

    var Content = Spine.Model.sub();
    Content.configure('Content', 'value', 'type', 'cursor');

    return Content;
});