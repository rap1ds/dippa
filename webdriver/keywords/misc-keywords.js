"use strict";

var debug = require('../reporter').debug;

module.exports = {
    "Random": function(next) {
        next(Math.random() * 1000);
    },

    "Generate Random Text": function(next) {
        var Lipsum = require('node-lipsum');
        var lipsum = new Lipsum();
        var lipsumOpts = {
            start: 'yes',
            what: 'bytes',
            amount: 80
        };

        lipsum.getText(next, lipsumOpts);
    },

    "Info": function(next, driver, msg) {
        debug(msg);
        next();
    }
};