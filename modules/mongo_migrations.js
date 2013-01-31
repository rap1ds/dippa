/**
	Very simple migration "framework" to be run on 
	mongo initialization
*/

var mongoProfiles = require('./mongo_profiles');
var mongoose = require('mongoose');
var _ = require('underscore');
var shortId = require('shortid');

var migrations = [

	function addPreviewId(mongoose) {
		var Dippa = mongoose.model('Dippa');

		console.log("Running migration 'add preview id'");

		Dippa.find({'previewId': null}, function(error1, data) {
			data.forEach(function(dippa) {
				var id = dippa.shortId;
				var previewId = shortId.generate();

				dippa.previewId = previewId;

				dippa.save(function(error2) {
					console.log("Updated dippa '" + id + "'' with previewId '" + previewId + "'");
				});
			});
		});
	}
]

module.exports = function(mongoose) {
	migrations.forEach(function(migration) {
		migration(mongoose);
	});
};