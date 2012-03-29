/**
 * Created by JetBrains WebStorm.
 * User: mikko
 * Date: 12/25/11
 * Time: 3:33 PM
 * To change this template use File | Settings | File Templates.
 */

/*global node:true */

var commandline = require('./modules/commandline');
var Command = require('./modules/commandline').Command;
var express = require('express');
var app = express.createServer();
var fs = require('fs');
var path = require('path');
var shortId = require('shortid');
var Mongo = require('./modules/mongo');
var jqtpl = require("jqtpl");
var p = require('node-promise');
var Promise = p.Promise;
var PromisedIO = require("promised-io/promise");
var PromisedFS = require("promised-io/fs").fs;

var REPOSITORY_DIR = "./public/repositories/";
var PORT = 5555;

Mongo.init();

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

app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){

    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
    app.use(express.errorHandler());
});

function create(id, owner, name, email, noGithub, success, error) {
    var repoDir = path.resolve(REPOSITORY_DIR, id);

    var mkdir = new Command('mkdir -p ' + repoDir);
    var init = new Command('git init', repoDir);
    var config = new Command('git config user.email mikko.koski@aalto.fi');
    var remote = new Command('git remote add origin ssh://dippa.github.com/' + owner + '/' + name + '.git', repoDir);
    var pull = new Command('git pull');
    var cpDoc = new Command('cp ../../../template.tex ./dippa.tex', repoDir);
    var cpRef = new Command('cp ../../../template_ref.bib ./ref.bib', repoDir);
    var add = new Command('git add dippa.tex', repoDir);
    var commit = new Command('git commit -m FirstCommit', repoDir);
    var push = new Command('git push -u origin master', repoDir);

    var commandsToRun, isDemo;

    if(noGithub) {
        commandsToRun = [mkdir, cpDoc, cpRef];
        isDemo = true;
    } else {
        commandsToRun = [mkdir, init, config, remote, pull, cpDoc, cpRef, add, commit, push];
        isDemo = false;
    }


    commandline.runAll(commandsToRun).then(function() {
        console.log('Done');

        Mongo.createNew(id, owner, name, email, isDemo).then(function() {
            success(id);
        }, function(e) {
            error(e);
        });
    });
}

// The best way to trigger this? Timer?
(function removeOldDemos() {
    var commandsToRun = [];

    Mongo.findOldDemos().then(function(oldDemos) {
        oldDemos = oldDemos || [];

        console.info('Found ' + oldDemos.length + ' old demos ready to be removed');

        oldDemos.forEach(function(oldDemo) {
            var repoDir = path.resolve(REPOSITORY_DIR, oldDemo.shortId);
            commandsToRun.push(new Command('rm -r ' + repoDir));

            console.info('About to remove dir ' + repoDir);
        });

        commandline.runAll(commandsToRun).then(function() {
            console.log('Old demo directories removed. Done!');

            Mongo.removeOldDemos().then(function() {
                console.log('Removed old demos from DB');
            }, function(e) {
                console.error('Failed to remove old demos from DB');
            });
        });
    });
})(); // Run once on startup

app.post('/create', function(req, res){
    var repo = req.body.repo || {};

    var owner = repo.owner;
    var name = repo.name;
    var email = req.body.email;
    var isDemo = req.body.isDemo;

    var id = shortId.generate();

    if(!isDemo && !(owner && name)) {
        // Send error message
        res.send('Error');
        return;
    }

    create(id, owner, name, email, isDemo, function(id) {
        res.send(id);
    }, function(error) {
        res.send(error);
    });
});

app.get('/load/:id', function(req, res){
    console.log('Loading id ' + id);
    var id = req.params.id;

    var response = {};

    var documentRead = new Promise();
    var referencesRead = new Promise();

    var allRead = p.all(documentRead, referencesRead);

    allRead.then(function(results) {
        response.documentContent = results[0];
        response.referencesContent = results[1];
        res.send(JSON.stringify(response));
    });

    fs.readFile(REPOSITORY_DIR + '/' + id + '/dippa.tex', 'UTF-8', function(err, data) {
        if(err) {
            throw err;
        }

        console.log('Document reading done');
        documentRead.resolve(data);
    });

    fs.readFile(REPOSITORY_DIR + '/' + id + '/ref.bib', 'UTF-8', function(err, data) {
        if(err) {
            throw err;
        }

        console.log('References reading done');
        referencesRead.resolve(data);
    });
});

app.post('/save/:id', function(req, res){
    var id = req.params.id;
    var repoDir = REPOSITORY_DIR + id + '/';
    var texFile = repoDir + 'dippa.tex';
    var refFile = repoDir + 'ref.bib';

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

        var previewPromise = new Promise();

        previewPromise.then(function(output) {
            res.send(output);
        });

        var latex1 = new Command('latex --interaction=nonstopmode dippa', repoDir);
        var bibtex1 = new Command('bibtex dippa', repoDir);
        var latex2 = new Command('latex --interaction=nonstopmode dippa', repoDir);
        var bibtex2 = new Command('bibtex dippa', repoDir);
        var pdflatex = new Command('pdflatex --interaction=nonstopmode dippa', repoDir);

        commandline.runAll([latex1, bibtex1, latex2, bibtex2, pdflatex]).then(function(output) {
            previewPromise.resolve(output);
        });

        mongoReady.then(function(result) {
            if(result.isDemo) {
                console.log('Demo, not pushing');
                return;
            }

            var commitMessage = "Update";
            var addtex = new Command('git add dippa.tex', repoDir);
            var addref = new Command('git add ref.bib', repoDir);
            var commit = new Command('git commit --all --message="' + commitMessage + '"', repoDir);
            var pull = new Command('git pull', repoDir);
            var push = new Command('git push', repoDir);

            commandline.runAll([addtex, addref, commit, pull, push]).then(function() {
                // Nothing here
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
        console.log('All files copied', resultMessage);
        res.send(JSON.stringify(resultMessage));
    });
});

app.delete('/upload/:id/:filename', function(req, res, next) {
    var repoDir = REPOSITORY_DIR + req.params.id + '/';
    var filename = req.params.filename;

    if(filename.length === 0) {
        return;
    }

    var filepath = repoDir + filename;
    console.log('Removing file', filepath);
    fs.unlink(filepath, function() {
        res.send();
    })
});

app.get('/:id', function(req, res, next) {
    var id = req.params.id
    Mongo.findByShortId(id).then(function(data) {
        if(data) {
            res.render('index.html');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/', function(req, res, next) {
    res.render('index.html');
});

app.listen(PORT);
console.log('Listening port ' + PORT);
