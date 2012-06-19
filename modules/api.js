"use strict";

var Mongo = require('../modules/mongo');
var commandline = require('../modules/commandline');
var Command = require('../modules/commandline').Command;
var express = require('express');
var app = express.createServer();
var p = require("promised-io/promise");
var path = require('path');
var Promise = p.Promise;
var PromisedIO = require("promised-io/promise");
var PromisedFS = require("promised-io/fs").fs;
var shortId = require('shortid');
var fs = require('fs');
var Directory = require('../modules/directory');
var _ = require('underscore');
var log = require('../modules/log');

var REPOSITORY_DIR = "./public/repositories/";
var TEMPLATE_DIR = "./templates/";

var API = {

    start: function(profile) {
        log('Staring the API again...');

        var started = new Promise();
        var configured = this.configure();

        app.get('/', this.getIndex);
        app.get('/:id', this.getId);
        app.delete('/upload/:id/:filename', this.deleteUploadedFile);
        app.get('/load/:id', this.getLoad);
        app.post('/create', this.postCreate);

        var profileResolved = new Promise();

        if(profile) {
            profileResolved.resolve(profile);
        } else {
            configured.then(function(profile) {
                profileResolved.resolve(profile);
            });
        }

        profileResolved.then(function(profile) {
            log('Current profile: ' + profile);

            this.profile = profile;

            if(profile === 'development') {
                this.configureDevelopment();
            } else if (profile === 'testing') {
                this.configureTesting();
            } else if (profile === 'staging') {
                this.configureStating();
            } else if (profile === 'production') {
                this.configureProduction();
            } else {
                throw "Illegal profile " + profile;
            }

            Mongo.init(this.mongoProfile);
            Directory.init(this.directoryProfile);
            log('About to listen port ' + this.port);
            app.listen(this.port);

            log('Listening port ' + this.port);
            log('Application successfully started');
            started.resolve();

        }.bind(this));

        return started;
    },

    configure: function() {
        var promise = new Promise();

        app.configure('development', function(){
            promise.resolve('development');
        });

        app.configure('testing', function(){
            promise.resolve('testing');
        });

        app.configure('staging', function(){
            promise.resolve('staging');
        });

        app.configure('production', function(){
            promise.resolve('production');
        });

        return promise;
    },

    configureDevelopment: function() {
        app.use(express.static(path.resolve(__dirname, '../public')));
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

        API.port = 5555;
        API.mongoProfile = Mongo.profiles.dev;
        API.directoryProfile = Directory.profiles.dev;
    },

    configureTesting: function() {
        app.use(express.static(path.resolve(__dirname, '../public')));
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

        API.port = 8888;
        API.mongoProfile = Mongo.profiles.test;
        API.directoryProfile = Directory.profiles.test;
    },

    configureStating: function() {
        app.use(express.static(path.resolve(__dirname, '../public')));
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

        API.port = 7777;
        API.mongoProfile = Mongo.profiles.staging;
        API.directoryProfile = Directory.profiles.staging;
    },

    configureProduction: function() {
        var oneYear = 31557600000;
        app.use(express.static(path.resolve(__dirname, '../public'), { maxAge: oneYear }));
        app.use(express.errorHandler());

        API.port = 5555;
        API.mongoProfile = Mongo.profiles.dev;
        API.directoryProfile = Directory.profiles.production;
    },

    getIndex: function(req, res, next) {
        res.render('index.html');
    },

    getId: function(req, res, next) {
        var id = req.params.id
        Mongo.findByShortId(id).then(function(data) {
            if(data) {
                res.render('index.html');
            } else {
                res.redirect('/');
            }
        });
    },

    deleteUploadedFile: function(req, res, next) {
        var id = req.params.id;
        var filename = req.params.filename;

        if(id == null || filename == null) {
            res.send({msg: 'Missing filename or id'}, 400);
        }

        log('DELETE Uploaded file', id, filename);

        Directory.deleteFile(id, filename).then(function success() {
            res.send(204);
        }, function error(err) {
            res.send({msg: 'An error occured while deleting file'}, 500);
            log.error('DELETE Failed to delete file', id, filename);
        });
    },

    getLoad: function(req, res, next){
        var id = req.params.id;

        var response = {};

        var documentRead = Directory.readDocumentFile(id);
        var referencesRead = Directory.readReferenceFile(id);

        p.all([documentRead, referencesRead]).then(function(results) {
            response.documentContent = results[0];
            response.referencesContent = results[1];
            res.send(response);
        }, function error() {
            res.send({msg: 'An error occured while reading content'}, 500);
            log.error('GET Failed to load', id);
        });
    },

    postCreate: function(req, res, next) {
        var repo = req.body.repo || {};

        var owner = repo.owner;
        var name = repo.name;
        var email = req.body.email;
        var isDemo = req.body.isDemo;
        var template = req.body.template;

        if(!isDemo && !(owner && name)) {
            // Send error message
            log.error('POST Create failed: Not deme, but still no owner & name', owner, name);
            res.send('Error');
            return;
        }

        var id = shortId.generate();

        var directoryOptions = {id: id, name: name, owner: owner, noGithub: isDemo, template: template};

        var createdAndCompiled = p.seq([Directory.create, Directory.compile], directoryOptions);
        var mongoCreated = Mongo.createNew(id, owner, name, email, isDemo);

        p.all(createdAndCompiled, mongoCreated).then(function() {
            log('POST Created new Dippa', directoryOptions);
            res.send(id);
        }, function(error) {
            log.error('POST Failed to create new Dippa', directoryOptions);
            res.send(error);
        });
    }
};

module.exports = API;

app.configure(function(){
    app.use(express.bodyParser());

    // disable layout
    app.set("view options", {layout: false});

    app.disable('view cache');

    // make a custom html template
    app.register('.html', {
        compile: function(str, options){
            return function(locals){
                return str;
            };
        }
    });
});

app.post('/save/:id', function(req, res){
    var id = req.params.id;
    var repoDir = path.resolve(REPOSITORY_DIR, id);
    var texFile = path.resolve(repoDir, 'dippa.tex');
    var refFile = path.resolve(repoDir, 'ref.bib');

    var docContent = req.body.documentContent;
    var refContent = req.body.referencesContent;

    var docWritten = new Promise();
    var refWritten = new Promise();
    var allWritten = p.all([docWritten, refWritten]);

    // Check if demo
    var mongoReady = Mongo.findByShortId(id);

    fs.writeFile(texFile, docContent, function (err) {
        if (err) {
            throw err;
        }

        docWritten.resolve();
    });

    fs.writeFile(refFile, refContent, function (err) {
        if (err) {
            throw err;
        }

        refWritten.resolve();
    });

    allWritten.then(function() {

        var previewPromise = Directory.compile(repoDir);

        previewPromise.then(function(output) {
            res.send(output);
        });

        mongoReady.then(function(result) {
            if(result.isDemo) {
                log('Demo, not pushing');
                return;
            }

            var commitMessage = "Update";
            var addtex = new Command('git add dippa.tex', repoDir);
            var addref = new Command('git add ref.bib', repoDir);
            var commit = new Command('git commit --all --message="' + commitMessage + '"', repoDir);
            var pull = new Command('git pull', repoDir);
            var push = new Command('git push', repoDir);

            commandline.runAll([addtex, addref, commit, pull, push]).then(function(allOutputs) {
                // Log all Git output
                (allOutputs || []).forEach(function(output) {
                    output = output || {};
                    log(output.type + ": " + output.value);
                });
            });

        });

    });
});

function readdir(repoDir, successCallback, errorCallback) {
    var exclude = ['.git', 'dippa.tex', 'ref.bib', 'dippa.aux', 'dippa.bbl', 'dippa.blg', 'dippa.dvi', 'dippa.log', 'dippa.pdf'];

    fs.readdir(repoDir, function(err, files) {
        if(err) {
            errorCallback(err);
        }

        files = files.filter(function(value) {
            return exclude.indexOf(value) === -1;
        });

        successCallback(files);
    });
}

app.get('/uploads/:id', function(req, res, next) {

    var repoDir = REPOSITORY_DIR + req.params.id + '/';

    readdir(repoDir, function success(files) {
        res.send(JSON.stringify(files));
    }, function error(err) {
        res.send(err);
    });
});

app.post('/upload/:id', function(req, res, next) {
    var repoDir = REPOSITORY_DIR + req.params.id + '/';
    var files = req.files.files;

    var copyPromises = [];
    var resultMessage = [];
    files.forEach(function(file) {
        var deferred = new PromisedIO.Deferred();

        var fs = require('fs'),
            util = require('util');

        var is = fs.createReadStream(file.path)
        var os = fs.createWriteStream(repoDir + file.name);

        util.pump(is, os, function() {
            fs.unlink(file.path, function() {
                resultMessage.push({filename: file.name});
                deferred.resolve();
            });
        });
        copyPromises.push(deferred);
    });

    var allFilesCopied = PromisedIO.all(copyPromises);

    allFilesCopied.then(function() {
        log('All files copied', resultMessage);
        res.send(JSON.stringify(resultMessage));
    });
});