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

var REPOSITORY_DIR = "./repositories/";
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

function create(id, owner, name, email, existingRepo, success, error) {
    var repoDir = path.resolve(REPOSITORY_DIR, id);

    var mkdir = new Command('mkdir -p ' + repoDir);
    var init = new Command('git init', repoDir);
    var config = new Command('git config user.email mikko.koski@aalto.fi');
    var remote = new Command('git remote add origin ssh://dippa.github.com/' + owner + '/' + name + '.git', repoDir);
    var pull = new Command('git pull');
    var cpDoc = new Command('cp ../../template.tex ./dippa.tex', repoDir);
    var cpRef = new Command('cp ../../template_ref.bib ./ref.bib', repoDir);
    var add = new Command('git add dippa.tex', repoDir);
    var commit = new Command('git commit -m FirstCommit', repoDir);
    var push = new Command('git push -u origin master', repoDir);
    var clone = new Command('git clone ssh://dippa.github.com/' + owner + '/' + name + '.git');

    var commandsToRun;

    if(existingRepo) {
        console.log('Creating existing repo');
        var rm = new Command('rm -rf repositories/1234');
        var mv = new Command('mv ' + name + ' repositories/1234');
        commandsToRun = [clone, rm, mv, cpDoc, cpRef, add, commit, push];
    } else {
        console.log('Creating fresh new repo');
        commandsToRun = [mkdir, init, config, remote, pull, cpDoc, cpRef, add, commit, push];
    }

    commandline.runAll(commandsToRun).then(function() {
        console.log('Done');

        Mongo.createNew(id, owner, name, email).then(function() {
            success(id);
        }, function(error) {
            error(error);
        });
    });
}

app.post('/create', function(req, res){
    var owner = req.body.repo.owner;
    var name = req.body.repo.name;
    var email = req.body.email;

    var id = shortId.generate();

    if(!(owner && name)) {
        // Send error message
        res.send('Error');
        return;
    }

    create(id, owner, name, email, false, function(id) {
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
    var repoDir = 'repositories/' + id + '/';
    var texFile = repoDir + 'dippa.tex';
    var refFile = repoDir + 'ref.bib';

    var docContent = req.body.documentContent;
    var refContent = req.body.referencesContent;

    var docWritten = new Promise();
    var refWritten = new Promise();
    var allWritten = p.all([docWritten, refWritten]);

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
        var pushPromise = new Promise();

        previewPromise.then(function() {
            res.send("ok");
        });

        var latex1 = new Command('latex dippa', repoDir);
        var bibtex1 = new Command('bibtex dippa', repoDir);
        var latex2 = new Command('latex dippa', repoDir);
        var bibtex2 = new Command('bibtex dippa', repoDir);
        var pdflatex = new Command('pdflatex dippa', repoDir);
        var copy = new Command('cp ' + repoDir + 'dippa.pdf public/preview/' + id + '.pdf');

        commandline.runAll([latex1, bibtex1, latex2, bibtex2, pdflatex, copy]).then(function() {
            previewPromise.resolve();
        });

        var commitMessage = "Update";
        var addtex = new Command('git add dippa.tex', repoDir);
        var addref = new Command('git add ref.bib', repoDir);
        var commit = new Command('git commit --all --message="' + commitMessage + '"', repoDir);
        var pull = new Command('git pull', repoDir);
        var push = new Command('git push', repoDir);

        commandline.runAll([addtex, addref, commit, pull, push]).then(function() {
            pushPromise.resolve();
        });

    });
});

app.get('/:id', function(req, res, next) {
    var id = req.params.id
    console.log(id);
    Mongo.findByShortId(id).then(function(data) {
        if(data.length) {
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
