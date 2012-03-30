var http = require('http');
var Promise = require('node-promise').Promise;

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

module.exports = {
    Integration: Integration
};