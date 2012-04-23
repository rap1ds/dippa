// var nodePromise = require('node-promise');
var promisedIO = require("promised-io/promise");
var _ = require('underscore');

process.on('uncaughtException', function(err) {
    console.log('*** !!! Uncaught expection !!! ***');
});

xdescribe('node-promise', function() {

    function fail(time) {
        var p = new nodePromise.Promise();
        _.delay(function() {
            p.reject();
        }, time);
        return p;
    }

    function succ(time) {
        var p = new nodePromise.Promise();
        _.delay(function() {
            p.resolve();
        }, time);
        return p;
    }

    it('node-promise: should not break if multiple promises are rejected', function() {
        var resolved, rejected;

        nodePromise.allOrNone(fail(25), fail(50)).then(function() {
            resolved = true;
        }, function() {
            rejected = true;
        });

        waitsFor(function() {
            return resolved || rejected;
        });

        runs(function() {
            expect(resolved).toBeFalsy();
            expect(rejected).toBeTruthy();
        });

    });

    it('node-promise: should not break if promise is resolved after first being rejected', function() {
        var resolved, rejected;

        nodePromise.allOrNone(fail(25), succ(50)).then(function() {
            resolved = true;
        }, function() {
            rejected = true;
        });

        waitsFor(function() {
            return resolved || rejected;
        });

        runs(function() {
            expect(resolved).toBeFalsy();
            expect(rejected).toBeTruthy();
        });
    });

});

describe('promised-io', function() {

    function fail(time) {
        var p = new promisedIO.Promise();
        _.delay(function() {
            p.reject();
        }, time);
        return p;
    }

    function succ(time) {
        var p = new promisedIO.Promise();
        _.delay(function() {
            p.resolve();
        }, time);
        return p;
    }

    it('promised-io: should not break if multiple promises are rejected', function() {
        var resolved, rejected;

        promisedIO.all(fail(25), fail(50)).then(function() {
            resolved = true;
        }, function() {
            rejected = true;
        });

        waitsFor(function() {
            return resolved || rejected;
        });

        runs(function() {
            expect(resolved).toBeFalsy();
            expect(rejected).toBeTruthy();
        });

    });

    it('promised-io: should not break if promise is resolved after first being rejected', function() {
        var resolved, rejected;

        promisedIO.all(fail(25), succ(50)).then(function() {
            resolved = true;
        }, function() {
            rejected = true;
        });

        waitsFor(function() {
            return resolved || rejected;
        });

        runs(function() {
            expect(resolved).toBeFalsy();
            expect(rejected).toBeTruthy();
        });
    });

});