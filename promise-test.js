var nodePromise = require('node-promise');
var Promise = nodePromise.Promise;
var _ = require('underscore');

// This works:

var successPromise1 = new Promise();
var errorPromise1 = new Promise();

nodePromise.allOrNone(errorPromise1, successPromise1).then(function() {
    console.log('All promises resolved, should not come here');
}, function() {
    console.log('One or more promises rejected, should come here');
});

_.delay(function() {
    successPromise1.reject();
}, 200);

_.delay(function() {
    errorPromise1.reject();
}, 201);

// This fails:

/*
var successPromise2 = new Promise();
var errorPromise2 = new Promise();

nodePromise.allOrNone(successPromise2, errorPromise2).then(function success() {
    console.log('All promises resolved, should not come here');
}, function error() {
    console.log('One or more promises rejected, should come here');
});

_.delay(function() {
    successPromise2.resolve();
}, 300);

_.delay(function() {
    errorPromise2.reject();
}, 301);
*/