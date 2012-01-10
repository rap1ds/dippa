var Mongo = require('../modules/mongo');

describe('Mongo', function() {
    var fakeDippa, FakeDippa, fakePromiseReturningFunction, fakePromise;

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
        expect(fakeDippa.save).toHaveBeenCalled();
        expect(promise.then).toBeDefined();

    });

    it('should find detailed info by id', function() {
        var shortId = "zUNGat12";

        var promise = Mongo.findByShortId(shortId);

        expect(FakeDippa.find.mostRecentCall.args[0]).toEqual({shortId: "zUNGat12"});
        expect(promise.then).toBeDefined();
    });

    it('should find by email', function() {
        var email = "mikko.koski@invalid.fi";

        var promise = Mongo.findByEmail(email);

        expect(FakeDippa.find.mostRecentCall.args[0]).toEqual({email: "mikko.koski@invalid.fi"});
        expect(promise.then).toBeDefined();
    })

})