"use strict";

var key = require('keyword');
var debug = require('../reporter').debug;

key("Random", function(next) {
    next(Math.random() * 1000);
});

key("Generate Random Text", function(next) {
    var Lipsum = require('node-lipsum');
    var lipsum = new Lipsum();
    var lipsumOpts = {
        start: 'yes',
        what: 'bytes',
        amount: 80
    };

    lipsum.getText(next, lipsumOpts);
});

key("Info", function(next, driver, msg) {
    debug(msg);
    next();
});