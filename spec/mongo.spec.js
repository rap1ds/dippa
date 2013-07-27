var Mongo = require('../modules/mongo');
var _ = require('underscore');
var DateUtils = require('../modules/dateutils');
var mongoProfiles = require('../modules/mongo_profiles');

// Initialize database for tests
Mongo.init(mongoProfiles.test);

describe('Mongo', function() {
    "use strict";
    
    var fakeDippa, FakeDippa, fakePromiseReturningFunction, fakePromise;
    var now = new Date('2012-03-29T08:03:48.223Z');
    var Dippa = Mongo.Dippa;

    beforeEach(function() {
        spyOn(DateUtils, 'now').andReturn(now);

        this.addMatchers({
            toBeDate: function() {
                return _.isDate(this.actual);
            }
        });
    });

    describe('unit tests', function() {
        beforeEach(function() {
            FakeDippa = function() {
                fakeDippa = this;
            };
            FakeDippa.prototype.save = jasmine.createSpy();
            FakeDippa.find = jasmine.createSpy();

            Mongo.Dippa = FakeDippa;
        });

        it('should create a new dippa', function() {
            var shortId = "zUNGat12";
            var owner = "rap1ds";
            var name = "dippa";
            var email = "mikko.koski@invalid.fi";

            var promise = Mongo.createNew(shortId, owner, name, email);

            expect(fakeDippa.shortId).toEqual("zUNGat12");
            expect(fakeDippa.owner).toEqual("rap1ds");
            expect(fakeDippa.name).toEqual("dippa");
            expect(fakeDippa.email).toEqual("mikko.koski@invalid.fi");
            expect(fakeDippa.created).toBeDate();
            expect(fakeDippa.created).toEqual(now);
            expect(fakeDippa.save).toHaveBeenCalled();
            expect(promise.then).toBeDefined();
        });

        it('should create a new demo dippa', function() {
            var shortId = "zUNGat12";
            var owner = "rap1ds";
            var name = "dippa";
            var email = "mikko.koski@invalid.fi";
            var isDemo = true;

            var promise = Mongo.createNew(shortId, owner, name, email, isDemo);

            expect(fakeDippa.shortId).toEqual("zUNGat12");
            expect(fakeDippa.owner).toEqual("rap1ds");
            expect(fakeDippa.name).toEqual("dippa");
            expect(fakeDippa.email).toEqual("mikko.koski@invalid.fi");
            expect(fakeDippa.isDemo).toBeTruthy();
            expect(fakeDippa.created).toBeDate();
            expect(fakeDippa.created).toEqual(now);
            expect(fakeDippa.save).toHaveBeenCalled();
            expect(promise.then).toBeDefined();
        });

        it('should find by email', function() {
            var email = "mikko.koski@invalid.fi";

            var promise = Mongo.findByEmail(email);

            expect(FakeDippa.find.mostRecentCall.args[0]).toEqual({email: "mikko.koski@invalid.fi"});
            expect(promise.then).toBeDefined();
        });

        afterEach(function() {
            Mongo.Dippa = Dippa;
        });
    });

    describe('integration tests', function() {

        beforeEach(function() {
            var fixturesLoaded = false;

            Mongo.loadFixtures().then(function() {
                fixturesLoaded = true;
            });

            waitsFor(function() {
                return fixturesLoaded;
            });
        });

        var testDB = function(dbPromise, callback) {
            var promiseArguments;
            var prommiseResolved = false;

            runs(function() {
                dbPromise.then(function() {
                    promiseArguments = arguments;
                    prommiseResolved = true;
                });
            });

            waitsFor(function() {
                return prommiseResolved;
            });

            runs(function() {
                callback.apply(this, promiseArguments);
            });
        };

        it('should find detailed info by id', function() {
            testDB(Mongo.findByShortId('123456C'), function(result) {
                expect(result.shortId).toEqual('123456C');
                expect(result.owner).toEqual('rap1ds');
                expect(result.name).toEqual('newDemoDippa');
                expect(result.email).toEqual('mikko.koski@invalid.fi');
                expect(result.isDemo).toEqual(true);
                expect(result.created).toEqual(new Date('2012-03-27T08:03:48.223Z'));
            });
        });

        it('should create a new dippa', function() {
            var shortId = "zUNGat12";
            var owner = "rap1ds";
            var name = "dippa";
            var email = "mikko.koski@invalid.fi";

            testDB(Mongo.createNew(shortId, owner, name, email), function() {
                testDB(Mongo.findByShortId(shortId), function(result) {
                    expect(result.shortId).toEqual("zUNGat12");
                    expect(result.owner).toEqual("rap1ds");
                    expect(result.name).toEqual("dippa");
                    expect(result.email).toEqual("mikko.koski@invalid.fi");
                    expect(result.created).toBeDate();
                    expect(result.created).toEqual(now);
                });
            });
        });

        it('should find more than 7 days old demo dippas', function() {
            testDB(Mongo.findOldDemos(), function(dbResults) {
                expect(dbResults.length).toEqual(1);
                var oldDemo = dbResults[0];
                expect(oldDemo.shortId).toEqual('123456D');
            });
        });

        it('should remove all the old demo dippas', function() {
            testDB(Mongo.removeOldDemos(), function() {
                testDB(Mongo.findOldDemos(), function(dbResults) {
                    expect(dbResults.length).toEqual(0);
                });
                testDB(Mongo.findAll(), function(dbResults) {
                    expect(dbResults.length).toEqual(3);
                    expect(dbResults[0].shortId).toEqual('123456A');
                    expect(dbResults[1].shortId).toEqual('123456B');
                    expect(dbResults[2].shortId).toEqual('123456C');
                });
            });
        });
    });
});