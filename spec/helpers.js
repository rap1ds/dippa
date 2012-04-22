var http = require('http');
var Promise = require('node-promise').Promise;
var _ = require('underscore');

var Integration = {

    testRequest: function(opts, confs, callback) {
        var promiseResult;

        var promise = Promise();
        opts = opts || {};
        opts.port = confs.port;
        opts.headers = opts.headers || {
            "Content-Type": "application/json"
        };

        var req = http.request(opts, function(res) {
            var statusCode = res.statusCode;
            var headers = res.headers;
            var body = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                if(headers['content-type'] === 'application/json') {
                    body = body !== '' ? JSON.parse(body) : {};
                }

                promise.resolve({statusCode: statusCode, headers: headers, body: body});
            });
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        if(opts.body) {
            req.write(JSON.stringify(opts.body));
        }

        req.end();

        promise.then(function() {
            promiseResult = arguments;
        });

        waitsFor(function() {
            return promiseResult;
        });

        runs(function() {
            callback.apply(this, promiseResult);
        });
    }
};

var Common = {
    waitsForPromise: function(promise) {

        promise.then(function resolved() {
            promise.resolved = true;
            promise.result = _.toArray(arguments);
        }, function rejected() {
            promise.rejected = true;
            promise.result = _.toArray(arguments);
        });

        waitsFor(function() {
            return promise.resolved || promise.rejected;
        });
    },

    spyOnPromise: function(Klass, method) {
            if(!method) {
                throw "Please give the method to spy as a String";
            }

            var spy = spyOn(Klass, method);
            var realPromise = new Promise();

            return {
                andCallSuccess: function(returnValue) {
                    spy.andReturn({
                        then: function(callback) {
                            callback(returnValue);
                        }
                    });
                },
                andCallError: function(errorValue) {
                    spy.andReturn({
                        then: function(callback, error) {
                            error(errorValue);
                        }
                    });
                },
                andCallRealSuccess: function(returnValue) {
                    realPromise.resolve(returnValue);
                    spy.andReturn(realPromise);
                    return realPromise;
                },
                andCallRealError: function(errorValue) {
                    realPromise.reject(errorValue);
                    spy.andReturn(realPromise);
                    return realPromise;
                }
            };
        }
};

module.exports = {
    Integration: Integration,
    Common: Common
};