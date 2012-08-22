define(function() {
    "use strict";

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