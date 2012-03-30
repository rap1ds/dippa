
var commandline = require('../modules/commandline');
var Command = require('../modules/commandline').Command;
var path = require('path');
var Promise = require('node-promise').Promise;
var fs = require('fs');

var REPOSITORY_DIR = "./public/repositories/";
var TEMPLATE_DIR = "./templates/";

var Directory = {

    create: function(id, name, owner, noGithub) {
        var promise = new Promise();

        var repoDir = path.resolve(REPOSITORY_DIR, id);
        var texTemplate = path.resolve(TEMPLATE_DIR, "template.tex");
        var refTemplate = path.resolve(TEMPLATE_DIR, "template_ref.bib");

        var mkdir = new Command('mkdir -p ' + repoDir);
        var init = new Command('git init', repoDir);
        var config = new Command('git config user.email mikko.koski@aalto.fi');
        var remote = new Command('git remote add origin ssh://dippa.github.com/' + owner + '/' + name + '.git', repoDir);
        var pull = new Command('git pull');
        var cpDoc = new Command('cp ' + texTemplate + ' ./dippa.tex', repoDir);
        var cpRef = new Command('cp ' + refTemplate + ' ./ref.bib', repoDir);
        var add = new Command('git add dippa.tex ref.bib', repoDir);
        var commit = new Command('git commit -m FirstCommit', repoDir);
        var push = new Command('git push -u origin master', repoDir);

        var commandsToRun, isDemo;

        if(noGithub) {
            commandsToRun = [mkdir, cpDoc, cpRef];
        } else {
            commandsToRun = [mkdir, init, config, remote, pull, cpDoc, cpRef, add, commit, push];
        }

        commandline.runAll(commandsToRun).then(function() {
            promise.resolve();
        }, function() {
            promise.reject();
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

    readDocumentFile: function(id) {
        return this.readFile(id, 'dippa.tex');
    },

    readReferenceFile: function(id) {
        return this.readFile(id, 'ref.bib');
    }
};

module.exports = Directory;