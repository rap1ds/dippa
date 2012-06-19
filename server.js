var commandline = require('./modules/commandline');
var Command = require('./modules/commandline').Command;
var path = require('path');
var Mongo = require('./modules/mongo');
var API = require('./modules/api');
var _ = require('underscore');
var log = require('./modules/log');

API.start();

// The best way to trigger this? Timer?
_.delay(function removeOldDemos() {
    var commandsToRun = [];

    var REPOSITORY_DIR = "./public/repositories/";

    Mongo.findOldDemos().then(function(oldDemos) {
        oldDemos = oldDemos || [];

        log('Found ' + oldDemos.length + ' old demos ready to be removed');

        oldDemos.forEach(function(oldDemo) {
            var repoDir = path.resolve(REPOSITORY_DIR, oldDemo.shortId);
            commandsToRun.push(new Command('rm -r ' + repoDir));

            log('About to remove dir ' + repoDir);
        });

        commandline.runAll(commandsToRun).then(function() {
            log('Old demo directories removed. Done!');

            Mongo.removeOldDemos().then(function() {
                log('Removed old demos from DB');
            }, function(e) {
                log.error('Failed to remove old demos from DB');
            });
        });
    });
}, 3000); // Run once on startup