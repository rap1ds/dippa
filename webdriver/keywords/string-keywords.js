"use strict";

var key = require('keyword');
var _ = require('underscore');

key("Join", function() {
    var args = _.toArray(arguments);
    var next = _.head(args);
    var xs = _.tail(args, 2);

    next(xs.join(''));
});