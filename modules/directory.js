var commandline = require('../modules/commandline');
var Command = commandline.Command;
var path = require('path');
var when = require("promised-io/promise");
var Promise = require("promised-io/promise").Promise;
var fs = require('fs');
var wrench = require('wrench');
var _ = require('underscore');
var git = require('../modules/git');
var log = require('../modules/log');

var REPOSITORY_DIR = "./public/repositories/";

function ensureEmptyRepository(workingDir, allowedFiles) {
    allowedFiles = allowedFiles || [];
    workingDir = path.resolve(workingDir);

    var promise = new Promise();
    readContent(workingDir).then(function(files) {
        var isEmpty = _.all(files, function(file) {

            return _.include(allowedFiles, file);
        });
        log('Is empty repository? ' + isEmpty + ', files: ' + JSON.stringify(files) + ', allowed: ' + JSON.stringify(allowedFiles));
        promise.resolve(isEmpty);
    });
    return promise;
}

function readContent(directory) {
    var promise = new Promise();

    var files = fs.readdir(directory, function(err, files) {
        promise.resolve(files);
    });

    return promise;
}

var Directory = {

    // First in the array is the default
    templatesAvailable: [
        'basic-essay',
        'aalto-university-publication-series',
        'aalto',
        'aalto-thesis'
    ],

    profiles: {
        dev: {repoDir: "./public/repositories/", templateDir: "./templates/"},
        test: {repoDir: "./public/repositories_test/", templateDir: "./templates/"},
        staging: {repoDir: "./public/repositories/", templateDir: "./templates/"},
        production: {repoDir: "./public/repositories/", templateDir: "./templates/"}
    },

    init: function(profile) {
        _.bindAll(this);

        profile = profile || this.profiles.dev;
        this.profile = profile;

        REPOSITORY_DIR = profile.repoDir;
    },

    loadFixtures: function() {
        var promise = new Promise();

        // Double check
        if(!REPOSITORY_DIR.match('test')) {
            throw "Are you sure repository dir " + REPOSITORY_DIR + " is for testing?";
        }

        wrench.rmdirRecursive(REPOSITORY_DIR, function rmdirRecursivelyClbk(err) {
            wrench.copyDirRecursive('fixtures/files', REPOSITORY_DIR, function copyDirRecursivelyClbk(err) {
                if(err) {
                    promise.reject();
                    return;
                }

                promise.resolve();
            });
        });

        return promise;
    },

    create: function(opts) {
        var id = opts.id;
        var name = opts.name;
        var owner = opts.owner;
        var noGithub = opts.noGithub;
        var template = opts.template;

        var promise = new Promise();

        var repoDir = path.resolve(REPOSITORY_DIR, id);

        var templatePath = this.resolveTemplatePath(template);
        var createDirectory = [new Command('mkdir -p ' + repoDir)];
        var templateCommandsPromise = this.templateCommands(templatePath, repoDir);
        var cloneCommand = [];
        var pushCommand = [];

        if(!noGithub) {
            cloneCommand = [git.clone(owner, name, repoDir)];
            pushCommand = git.initialPush(repoDir);
        }

        var initializeCommands = createDirectory.concat(cloneCommand);

        commandline.runAll(initializeCommands).then(function() {
            ensureEmptyRepository(repoDir, ['.git', 'README.md', '.gitignore']).then(function(isEmpty) {
                templateCommandsPromise.then(function(templateCmd) {
                    var commandsToRun = templateCmd.concat(pushCommand);

                    commandline.runAll(commandsToRun).then(function() {
                        promise.resolve(repoDir);
                    }, function() {
                        promise.reject();
                    });
                });
            });

        }, function() {
            promise.reject();
        });
        
        return promise;
    },

    resolveTemplatePath: function(template) {
        template = this.templatesAvailable.indexOf(template) !== -1 ? template : this.templatesAvailable[0];
        template = path.resolve(this.profile.templateDir, template);
        return template;
    },

    templateCommands: function(templatePath, repoDir) {
        var promise = new Promise();

        var commands = [];
        fs.readdir(templatePath, function(err, files) {
            if(err) {
                promise.reject();
            }
            files.forEach(function(file) {
                commands.push(new Command('cp ' + templatePath + '/' + file + ' ' + repoDir));
            });
            promise.resolve(commands);
        });

        return promise;
    },

    readFile: function(id, filename) {
        var promise = new Promise();

        fs.readFile(REPOSITORY_DIR + '/' + id + '/' + filename, 'UTF-8', function(err, data) {
            if(err) {
                promise.reject(err);
                return;
            }
            promise.resolve(data);
        });

        return promise;
    },

    deleteFile: function(id, filename) {
        var promise = new Promise();

        fs.unlink(REPOSITORY_DIR + '/' + id + '/' + filename, function(err) {
            if(err) {
                promise.reject(err);
                return;
            }
            promise.resolve();
        });

        return promise;
    },

    readDocumentFile: function(id) {
        return this.readFile(id, 'dippa.tex');
    },

    readReferenceFile: function(id) {
        return this.readFile(id, 'ref.bib');
    }
};

module.exports = Directory;