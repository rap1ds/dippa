define(function() {
    "use strict";

    console.log('app/session.js');

    var sessionId;

    function createSession(id) {
        sessionId = id;
    }

    return Object.freeze(Object.create(Object.prototype, {
        createSession: {value: createSession},
        sessionId: {
            get: function() { return sessionId; }
        }
    }));
});