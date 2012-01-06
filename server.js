/**
 * Created by JetBrains WebStorm.
 * User: mikko
 * Date: 12/25/11
 * Time: 3:33 PM
 * To change this template use File | Settings | File Templates.
 */

var commandline = require('./modules/commandline');
var Command = require('./modules/commandline').Command;

var express = require('express')
    , app = express.createServer()
    , fs = require('fs')
    , path = require('path')
    , spawn = require('child_process').spawn
    , Github = require('./modules/github');

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

var REPOSITORY_DIR = "./repositories/";

app.post('/create', function(req, res){
    debugger;
    var repoInfo = Github.parseRepositoryUrl(req.body.repo);

    if(!repoInfo) {
        // Send error message
        res.send('Error');
        return;
    }

    var repoDir = path.resolve(REPOSITORY_DIR, repoInfo.owner, repoInfo.name);

    var mkdir = new Command('mkdir -p ' + repoDir);
    var init = new Command('git init', repoDir);
    var config = new Command('git config user.email mikko.koski@aalto.fi', repoDir);
    var touch = new Command('touch dippa.tex', repoDir);
    var add = new Command('git add dippa.tex', repoDir);
    var commit = new Command('git commit -m FirstCommit', repoDir);
    var remote = new Command('git remote add origin git@github.com:' + repoInfo.owner + '/' + repoInfo.name + '.git', repoDir);
    var push = new Command('git push -u origin master', repoDir);

    console.log('All commands created but not yet run');
});

app.get('/load', function(req, res){
    fs.readFile('repositories/PPBqWA9/dippa.tex', function(err, data) {
        if(err) {
            throw err;
        }
        res.send(data);
    });
});

app.post('/save', function(req, res){
    var texFile = 'repositories/PPBqWA9/dippa.tex'

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

        var previewCommand = new Command('/usr/texbin/pdflatex -synctex=1 -interaction=nonstopmode dippa.tex', 'repositories/PPBqWA9/');
        var copy = new Command('cp repositories/PPBqWA9/dippa.pdf public/PPBqWA9.pdf');

        commandline.runAll([previewCommand, copy]).then(function() {
            console.log('Preview ok');
            preview = true;
            tryComplete();
        });

        var commitMessage = "Update";
        console.log(commitMessage);

        var add = new Command('git add .', 'repositories/PPBqWA9/');
        var commit = new Command('git commit --all --message="' + commitMessage + '"', 'repositories/PPBqWA9/');
        var pull = new Command('git pull', 'repositories/PPBqWA9/');
        var push = new Command('git push', 'repositories/PPBqWA9/');

        commandline.runAll([add, commit, push]).then(function() {
            console.log('Commit ok');
            github = true;
            tryComplete();
        });
    });
});

// var GitHubApi = require("./node_modules/node-github/lib/github").GitHubApi;

// var github = new GitHubApi(true);
// github.authenticate("rap1ds-testing", "c77d15e3153e9dfb31e9d22cc55c7af3");
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

app.listen(3000);