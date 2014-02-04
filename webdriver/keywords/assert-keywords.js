"use strict";

var assert = require('assert');
var logAssertOk = require('../reporter').assertOk;
var logAssertFail = require('../reporter').assertFail;

module.exports = {
    
    "Should Equal": function(next, driver, a, b, msg) {
        try {
            assert.equal(a, b);
            logAssertOk(msg);
        } catch(e) {
            logAssertFail(msg);
            throw e;
        }
        next();
    }
};