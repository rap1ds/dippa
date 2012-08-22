define(['jquery', 'spine/spine'], function($, Spine) {
    "use strict";

    var Content = Spine.Model.sub();
    Content.configure('Content', 'value', 'type', 'cursor');

    return Content;
});