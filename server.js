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
    , spawn = require('child_process').spawn;

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/load', function(req, res){
    fs.readFile('../dippa_repo/dippa.tex', function(err, data) {
        if(err) {
            throw err;
        }
        res.send(data);
    });
});

app.post('/save', function(req, res){
    var texFile = '../dippa_repo/dippa.tex'

    fs.writeFile(texFile, req.body.value, function (err) {
        if (err) {
            throw err;
        }

        // "/usr/texbin/pdflatex" -synctex=1 -interaction=nonstopmode %.tex

        /*
        var pdflatex = spawn("/usr/texbin/pdflatex", ['-synctex=1', '-interaction=nonstopmode', '-output-directory=public', 'dippa.tex']);

        var output = "";

        pdflatex.stdout.on('data', function (data) {
            output += data;
        });

        pdflatex.stderr.on('data', function (data) {
            output += "ERROR: " + data;
        });

        pdflatex.on('exit', function(code) {
            res.send(output);
        });
        */

        var commitMessage = "Update";
        console.log(commitMessage);

        var add = new Command('git add .');
        var commit = new Command('git commit --all --message="' + commitMessage + '"');
        var push = new Command('git push');

        commandline.runAll([add, commit, push]).then(function() {
            console.log('Commit ok');
        })

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