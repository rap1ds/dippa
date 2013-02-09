define(function() {
    "use strict";

    console.log('app/session.js');

    var sessionId;
    var previewId;

    function createSession(id, prevId) {
        if(sessionId === undefined) {
            sessionId = id;
        }

        if(previewId === undefined) {
            previewId = prevId;
        }
    }

    return Object.freeze(Object.create(Object.prototype, {
        createSession: {value: createSession},
        sessionId: {
            get: function() { return sessionId; }
        },
        previewId: {
            get: function() { return previewId; }
        }
    }));
});