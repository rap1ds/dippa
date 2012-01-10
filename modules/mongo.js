var mongoose = require('mongoose')
    , p = require('node-promise');

var Mongo = {

    init: function() {
        mongoose.connect('mongodb://localhost/dippa');

        var DippaModel = {
            shortId : {type: String, unique: true },
            owner   : String,
            name    : String,
            email   : {type: String, index: true}
        };

        var Dippa = new mongoose.Schema(DippaModel);
        Dippa.index({owner: 1, name: 1}, {unique: true});
        mongoose.model('Dippa', Dippa);
        this.Dippa = mongoose.model('Dippa');

        this.Dippa.remove({}, function() {
            console.log('All removed!');
        });
    },

    createNew: function(shortId, owner, name, email) {
        var newDippa = new this.Dippa();
        newDippa.shortId = shortId;
        newDippa.owner = owner;
        newDippa.name = name;
        newDippa.email = email;

        var promise = p.Promise();

        newDippa.save(function(error) {
            Mongo.resolvePromise(error, undefined, promise)
        });

        return promise;
    },

    findByShortId: function(shortId) {
        var promise = p.Promise();
        this.Dippa.find({shortId: shortId}, function(error, data) {
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
