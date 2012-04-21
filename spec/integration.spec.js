var Mongo = require('../modules/mongo');

var IntegrationHelpers = require('./helpers').Integration;

// Initialize server for integration tests
var started = require('../modules/api').start('testing');

var confs = {port: 8888};

var testRequest = function(opts, callback) {
    return IntegrationHelpers.testRequest(opts, confs, callback);
};

var apiStarted = false;
started.then(function() {
    apiStarted = true;
});

waitsFor(function() {
    return apiStarted;
});

describe('Integration test', function() {

    beforeEach(function() {
        var fixturesLoaded;

        runs(function() {
            Mongo.loadFixtures().then(function() {
                fixturesLoaded = true;
            });
        });

        waitsFor(function() {
            return fixturesLoaded;
        });
    });

    xit('POST /create', function() {

    });

    xit('GET /load/:id', function() {

    });

    xit('GET /uploads/:id', function() {

    });

    xit('POST /upload/:id', function() {

    });

    xit('DELETE /upload/:id/:filename', function() {

    });

    it('GET /:id when id does exists', function() {
        testRequest({method: 'GET', path: '/123456A'}, function(result) {
            expect(result.statusCode).toEqual(200);
            expect(result.body).toMatch('<h1>Hello, this is Dippa Editor!</h1>');
        });
    });

    it('GET /:id when id does not exists', function() {
        testRequest({method: 'GET', path: '/1234'}, function(result) {
            expect(result.statusCode).toEqual(302);
            expect(result.headers.location).toEqual('http://localhost:' + confs.port + '/');
        });
    });

    it('GET / should render default index page', function() {
        testRequest({method: 'GET', path: '/'}, function(result) {
            expect(result.statusCode).toEqual(200);
            expect(result.body).toMatch('<h1>Hello, this is Dippa Editor!</h1>');
        });
    });
});