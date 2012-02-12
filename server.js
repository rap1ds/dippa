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

var express = require('express'),
    app = express.createServer(),
    fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    shortId = require('shortid'),
    // Github = require('public/scripts/github.js'),
    Mongo = require('./modules/mongo'),
    jqtpl = require("jqtpl");

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.configure(function(){
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

var REPOSITORY_DIR = "./repositories/";

Mongo.init();

Mongo.createNew("123456", "mikko", "koski", "mikko.koski@invalid.fi").then(function() { });
Mongo.createNew("123457", "mikko2", "koski", "mikko.koski@invalid.fi").then(function() { });

/*
 Mongo.createNew("1234567", "mikko", "koski", "mkos").then(function() {
 Mongo.findByEmail("mkos").then(function(emailData) {
 console.log(emailData);
 Mongo.findByShortId("123456").then(function(idData) {
 console.log(idData);

 // Create another with the same short id
 Mongo.createNew("1234567", "janne", "jaakko", "jj").then(function() {
 console.log('OK :(')
 }, function(error) {
 console.log('Error, hyvä!');
 console.log(error);

 // Create another with the same owner/name
 Mongo.createNew("3333", "mikko", "koski", "mkos").then(function() {
 console.log('OK :(')
 }, function(error) {
 console.log('Error, hyvä!');
 console.log(error);
 // error.code === 11000
 });
 })
 });
 });
 });
 */

app.post('/create', function(req, res){
    // var repoInfo = Github.parseRepositoryUrl(req.body.repo);
    var owner = req.body.repo.owner;
    var name = req.body.repo.name;
    var email = req.body.email;

    var id = shortId.generate();

    if(!(owner && name)) {
        // Send error message
        res.send('Error');
        return;
    }

    var repoDir = path.resolve(REPOSITORY_DIR, id);

    var mkdir = new Command('mkdir -p ' + repoDir);
    var init = new Command('git init', repoDir);
    var config = new Command('git config user.email mikko.koski@aalto.fi', repoDir);
    var cp = new Command('cp ../../template.tex ./dippa.tex', repoDir);
    // var touch = new Command('touch dippa.tex', repoDir);
    var add = new Command('git add dippa.tex', repoDir);
    var commit = new Command('git commit -m FirstCommit', repoDir);
    var remote = new Command('git remote add origin ssh://dippa.github.com/' + owner + '/' + name + '.git', repoDir);
    var pull = new Command('git pull');
    var push = new Command('git push -u origin master', repoDir);

    console.log('All commands created but not yet run');

    commandline.runAll([mkdir, init, config, cp, add, commit, remote, pull, push]).then(function() {
        console.log('Done');

        Mongo.createNew(id, owner, name, email).then(function() {
            res.send(id);
        }, function(error) {
            res.send(error);
        })
    });
});

app.get('/load/:id', function(req, res){
    console.log('Loading id ' + id);
    var id = req.params.id;

    fs.readFile(REPOSITORY_DIR + '/' + id + '/dippa.tex', function(err, data) {
        if(err) {
            throw err;
        }
        res.send(data);
    });
});

app.post('/save/:id', function(req, res){
    var id = req.params.id;
    var repoDir = 'repositories/' + id + '/';
    var texFile = repoDir + 'dippa.tex'

    fs.writeFile(texFile, req.body.value, function (err) {
        if (err) {
            throw err;
        }

        var preview = false;
        var github = false;

        var tryComplete = function() {
            if(preview === false || github === false) {
                return;
            }

            console.log('Kaikki ok!');

            res.send("ok");
        }

        var previewCommand = new Command('pdflatex -synctex=1 -interaction=nonstopmode dippa.tex', repoDir);
        var copy = new Command('cp ' + repoDir + 'dippa.pdf public/preview/' + id + '.pdf');

        commandline.runAll([previewCommand, copy]).then(function() {
            console.log('Preview ok');
            preview = true;
            tryComplete();
        });

        var commitMessage = "Update";
        console.log(commitMessage);

        var add = new Command('git add .', repoDir);
        var commit = new Command('git commit --all --message="' + commitMessage + '"', repoDir);
        var pull = new Command('git pull', repoDir);
        var push = new Command('git push', repoDir);

        commandline.runAll([add, commit, push]).then(function() {
            console.log('Commit ok');
            github = true;
            tryComplete();
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

// var GitHubApi = require("./node_modules/node-github/lib/github").GitHubApi;

// var github = new GitHubApi(true);
/*
 github.getUserApi().update("rap1ds-testing", {location: "Argentina"}, function(err) {
 console.log("done!");
 });*/

/*
 github.getRepoApi().search('dippa', function() {
 console.log(arguments);
 });
 */

// var repoApi = github.getRepoApi();

/*

 var mkdir = new Command('mkdir ../dippa_repo');
 var init = new Command('git init', '../dippa_repo');
 var config = new Command('git config user.email mikko.koski@aalto.fi', '../dippa_repo');
 var touch = new Command('touch README', '../dippa_repo');
 var add = new Command('git add README', '../dippa_repo');
 var commit = new Command('git commit -m first commit', '../dippa_repo');
 var remote = new Command('git remote add origin git@github.com:rap1ds-testing/dippa.git', '../dippa_repo');
 var push = new Command('git push -u origin master', '../dippa_repo');

 debugger;
 commandline.runAll([mkdir, init, config, touch, add, commit, remote, push]).then(function() {
 console.log('Done');
 debugger;
 });
 */

app.listen(5555);
