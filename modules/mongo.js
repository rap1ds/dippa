var mongoose = require('mongoose')
    , p = require('node-promise')
    , DateUtils = require('./dateutils')
    , Fixtures = require('../fixtures/fixtures')
    , _ = require('underscore');

var Mongo = {

    profiles: {
        dev: {db: "mongodb://localhost/dippa"},
        test: {db: "mongodb://localhost/dippa_test"}
    },

    init: function(profile) {
        profile = profile || this.profiles.dev;

        mongoose.connect(profile.db);

        var DippaModel = {
            shortId : {type: String, unique: true },
            owner   : String,
            name    : String,
            email   : {type: String, index: true},
            created : Date,
            isDemo  : Boolean
        };

        var Dippa = new mongoose.Schema(DippaModel);
        // Dippa.index({owner: 1, name: 1}, {unique: true});
        mongoose.model('Dippa', Dippa);
        this.Dippa = mongoose.model('Dippa');
    },

    loadFixtures: function() {
        var promise = p.Promise();

        this.Dippa.remove({}, function() {
            var allAdded = [];

            Fixtures.dippas.forEach(function(dippaHash) {
                var newDippaAdded = p.Promise();
                var dippa = new this.Dippa();

                for(key in dippaHash) {
                    dippa[key] = dippaHash[key];
                }

                dippa.save(function(error) {
                    if(error) {
                        console.error(error);
                        newDippaAdded.reject(error);
                    } else {
                        newDippaAdded.resolve();
                    }
                });

                allAdded.push(newDippaAdded);
            }, this);

            p.all(allAdded).then(function() {
                promise.resolve();
            }, function(error) {
                promise.reject(error);
            });

        }.bind(this));

        return promise;
    },

    createNew: function(shortId, owner, name, email, isDemo) {
        isDemo = isDemo || false;
        var newDippa = new this.Dippa();
        newDippa.shortId = shortId;
        newDippa.owner = owner;
        newDippa.name = name;
        newDippa.email = email;
        newDippa.isDemo = isDemo;
        newDippa.created = DateUtils.now();

        var promise = p.Promise();

        newDippa.save(function(error) {
            Mongo.resolvePromise(error, undefined, promise)
        });

        return promise;
    },

    findAll: function() {
        var promise = p.Promise();
        this.Dippa.find({}, function(error, data) {
            Mongo.resolvePromise(error, data, promise);
        });
        return promise;
    },

    findOldDemos: function() {
        var promise = p.Promise();
        var olderThan = 1000 * 60 * 60 * 24 * 7; // 7 days
        var tooOld = new Date(DateUtils.now().getTime() - olderThan);

        this.Dippa
            .where('isDemo', true)
            .where('created').lt(tooOld)
            .run(function(error, data) {
                Mongo.resolvePromise(error, data, promise);
            });
        return promise;
    },

    removeOldDemos: function() {
        var promise = p.Promise();
        var olderThan = 1000 * 60 * 60 * 24 * 7; // 7 days
        var tooOld = new Date(DateUtils.now().getTime() - olderThan);

        var conditions = {isDemo: true, created: {$lt: tooOld}};
        this.Dippa.remove(conditions, function(error, data) {
            Mongo.resolvePromise(error, data, promise);
        });

        return promise;
    },

    findByShortId: function(shortId) {
        var promise = p.Promise();
        this.Dippa.findOne({shortId: shortId}, function(error, data) {
            Mongo.resolvePromise(error, data, promise)
        });
        return promise;
    },

    findByEmail: function(email) {
        var promise = p.Promise();
        this.Dippa.find({email: email}, function(error, data) {
            Mongo.resolvePromise(error, data, promise)
        });
        return promise;
    },

    resolvePromise: function(error, data, promise) {
        if(error) {
            promise.reject(error);
        } else {
            promise.resolve(data);
        }
    }
}

module.exports = Mongo;
