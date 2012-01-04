/**
 * Created by JetBrains WebStorm.
 * User: mikko
 * Date: 12/25/11
 * Time: 3:33 PM
 * To change this template use File | Settings | File Templates.
 */

var express = require('express')
    , app = express.createServer()
    , fs = require('fs')
    , spawn = require('child_process').spawn;

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/load', function(req, res){
    fs.readFile('dippa.tex', function(err, data) {
        if(err) {
            throw err;
        }
        res.send(data);
    });
});

app.post('/save', function(req, res){
    var texFile = 'dippa.tex'

    fs.writeFile(texFile, req.body.value, function (err) {
        if (err) {
            throw err;
        }

        // "/usr/texbin/pdflatex" -synctex=1 -interaction=nonstopmode %.tex

        var pdflatex = spawn("/usr/texbin/pdflatex", ['-synctex=1', '-interaction=nonstopmode', 'dippa.tex']);

        pdflatex.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });

        pdflatex.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });

        pdflatex.on('exit', function(code) {
            console
            res.send('ok');
        });

    });
});

app.listen(3000);/**
 * Created by JetBrains WebStorm.
 * User: mikko
 * Date: 12/25/11
 * Time: 3:33 PM
 * To change this template use File | Settings | File Templates.
 */

var express = require('express')
    , app = express.createServer()
    , fs = require('fs')
    , spawn = require('child_process').spawn;

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/load', function(req, res){
    fs.readFile('dippa.tex', function(err, data) {
        if(err) {
            throw err;
        }
        res.send(data);
    });
});

app.post('/save', function(req, res){
    var texFile = 'dippa.tex'

    fs.writeFile(texFile, req.body.value, function (err) {
        if (err) {
            throw err;
        }

        // "/usr/texbin/pdflatex" -synctex=1 -interaction=nonstopmode %.tex

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

debugger;

var REPO = "git@github.com:rap1ds-testing/dippa.git";



/*
github.getUserApi().addKey('dippa', 'ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAvY3AZBs338KfngIziP1lx1UFAmRWPgIhCXEtzi4ouAeuwvGDwWoXkSC1Irt6XJAMKM3/q3/+SsRBhrgdOc2FiUrrjgf+JMJj9jvdwrEeHpbuOeIfOVVto56IUgDiUDOdzpmyVUxE/mHkT5Jorv05taFeXKlkBDA01CkZuchj2d/rOtrRunAiUanm6jhKaW/yNAMTqh5EaNB0DkcpofznSDqW/wor8Ll3aysuYpUd+6EX1LdltVIqDl+wss6ZSggVUfZ1FreGHpg2XGPQpxbOK2GBp0AjLClJLFk0u+hWbTWx3DwQ7lf3odM4VQR9MS5TQOs/UsMiTQyYfJLnPNi2vQ== rap1ds', function(err) {
    debugger;
    console.log(err);
});
*/

var command = require('./modules/commandline').command;

var mkdir = command('mkdir ../dippa_repo');
mkdir.when()
var touch1 = command('touch README1', '../dippa_repo');
var touch2 = command('touch README2', '../dippa_repo');



/*
var mkdir = spawn("mkdir", ['../dippa_repo']);
mkdir.on('exit', function() {
    debugger;
    var init = spawn("git", ["init"], {cwd: '../dippa_repo'});
    init.on('exit', function() {
        debugger;
        var config = spawn("git", ["config", "user.email", "mikko.koski@aalto.fi"], {cwd: '../dippa_repo'});
        config.on('exit', function() {
            debugger;
            var touch = spawn("touch", ["README"], {cwd: '../dippa_repo'});
            touch.on('exit', function() {
                debugger;
                var add = spawn("git", ["add", "README"], {cwd: '../dippa_repo'});
                add.on('exit', function() {
                    debugger;
                    var commit = spawn("git", ["commit", "-m", "first commit"], {cwd: '../dippa_repo'});
                    commit.on('exit', function() {
                        debugger;
                        var remote = spawn("git", ["remote", "add", "origin", "git@github.com:rap1ds-testing/dippa.git"], {cwd: '../dippa_repo'});
                        remote.on('exit', function() {
                            debugger;
                            var push = spawn("git", ["push", "-u", "origin", "master"], {cwd: '../dippa_repo'});
                            push.on('exit', function() {
                                debugger;
                            });

                            push.stdout.on('data', function (data) {
                                debugger;
                                console.log(data);
                            });

                            push.stderr.on('data', function (data) {
                                debugger;
                                console.log(data);
                            });
                        });
                    });
                });
            });
        });
    });
});
// });
*/

app.listen(4000);