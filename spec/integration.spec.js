var Mongo = require('../modules/mongo');
var Directory = require('../modules/directory');
var IntegrationHelpers = require('./helpers').Integration;

// Initialize server for integration tests
var started = require('../modules/api').start('testing');

Directory.init(Directory.profiles.test);

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
        var dbFixturesLoaded,
            fsFixturesLoaded;

        runs(function() {
            Mongo.loadFixtures().then(function() {
                dbFixturesLoaded = true;
            });

            Directory.loadFixtures().then(function() {
                fsFixturesLoaded = true;
            });
        });

        waitsFor(function() {
            return dbFixturesLoaded && fsFixturesLoaded;
        });
    });

    xit('POST /create', function() {

    });

    it('GET /load/:id', function() {
        testRequest({method: 'GET', path: '/load/123456A'}, function(result) {
            expect(result.statusCode).toEqual(200);
            var body = JSON.parse(result.body);
            expect(body.documentContent).toEqual('\\documentclass[a4paper]{article}\n\\end{document}');
            expect(body.referencesContent).toEqual('@article{koski2012,\nAuthor = {Mikko Koski},\nJournal = {Imaginary computer magazine},\nPages = {50-60},\nTitle = {How to use Dippa editor?},\nYear = {2012}}');
        });
    });

    xit('GET /uploads/:id', function() {

    });

    xit('POST /upload/:id', function() {

    });

    xit('DELETE /upload/:id/:filename, no file', function() {
        /* This should pass when repository_dir is changed to test dir */
        testRequest({method: 'DELETE', path: '/upload/123456A/filename.txt'}, function(result) {
            expect(result.statusCode).toEqual(400);
            var body = JSON.parse(result.body);
            expect(body.msg).toEqual('An error occured while deleting file');
        });
    });

    xit('DELETE /upload/:id/:filename', function() {
        /* This should pass when repository_dir is changed to test dir */
        testRequest({method: 'DELETE', path: '/upload/123456A/doggy.jpg'}, function(result) {
            expect(result.statusCode).toEqual(204);
        });
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
            expect(result.headers.location).toEqual('/');
        });
    });

    it('GET / should render default index page', function() {
        testRequest({method: 'GET', path: '/'}, function(result) {
            expect(result.statusCode).toEqual(200);
            expect(result.body).toMatch('<h1>Hello, this is Dippa Editor!</h1>');
        });
    });
});