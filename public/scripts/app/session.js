define(function() {
    "use strict";

    console.log('app/session.js');

    var sessionId;
    var previewId;

    function createSession(id) {
        sessionId = id;
    }

    return Object.freeze(Object.create(Object.prototype, {
        createSession: {value: createSession},
        sessionId: {
            get: function() { return sessionId; }
        },
        previewId: {
            set: function(id) { previewId = id; },
            get: function() { return previewId; }
        }
    }));
});