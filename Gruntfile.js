/*global module:false*/
module.exports = function(grunt) {
    "use strict";

    grunt.loadNpmTasks('grunt-contrib-jshint');

    var path = require('path');

    var REPOSITORY_PATH = 'public/repositories';

    // Project configuration.
    grunt.initConfig({
        test: {
            specs: 'spec/'
        },
        jshint: {
            files: ['server.js', 'grunt.js', 'fixtures/**/*.js', 'modules/**/*.js', 'spec/**/*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                laxcomma: true,
                node: true,
                globals: {
                    jQuery: true,

                    require: true,
                    define: true,
                    module: true,
                    console: true,
                    
                    // Jasmine
                    expect: true,
                    it: true,
                    xit: true,
                    describe: true,
                    xdescribe: true,
                    jasmine: true,
                    beforeEach: true,
                    afterEach: true,
                    runs: true,
                    waitsFor: true,
                    waits: true,
                    spyOn: true
                }
            }
        }
    });

    // Test
    grunt.registerTask('test', 'Run Jasmine tests', function() {

        var specs = grunt.config('test.specs');
        var cmd = 'node_modules/jasmine-node/bin/jasmine-node --forceexit ' + specs;
        var cwd = path.resolve();
        var done = this.async();

        grunt.log.writeln('Executing command ' + cmd + ' in directory ' + cwd);

        require('child_process').exec(cmd, {cwd: cwd}, function (error, stdout, stderr) {
            if (error) {
                grunt.log.writeln(stdout);
                grunt.log.writeln(error);
                grunt.log.error('Test runner exited with errors');
                done(false);
            } else {
                grunt.log.writeln(stdout);
                grunt.log.ok('Tests passed');
                done();
            }
        });
    });

    function startSelenium(callback) {
        var cmd = './runtests.py selenium-start';
        var cwd = path.resolve('./robot');

        grunt.log.writeln('Starting selenium server...');

        require('child_process').exec(cmd, {cwd: cwd}, function (error, stdout, stderr) {
            if (error) {
                grunt.log.writeln(stdout);
                grunt.log.error('Could not start selenium server');
                callback(false);
            } else {
                grunt.log.writeln(stdout);
                grunt.log.ok('Selenium server started');
                callback(true);
            }
        });
    }

    function stopSelenium(callback) {
        var cmd = './runtests.py selenium-stop';
        var cwd = path.resolve('./robot');

        grunt.log.writeln('Stopping selenium server...');

        require('child_process').exec(cmd, {cwd: cwd}, function (error, stdout, stderr) {
            if (error) {
                grunt.log.writeln(stdout);
                grunt.log.error('Could not stop selenium server');
                callback(false);
            } else {
                grunt.log.writeln(stdout);
                grunt.log.ok('Selenium server stopped');
                callback(true);
            }
        });
    }

    grunt.registerTask('test-robot', 'Run Robot tests', function(githubUsername, githubPassword, server) {
        var done = this.async();

        if(!githubUsername || !githubPassword) {
            grunt.log.error('Provide github username and password as arguments');
            done(false);
        }

        startSelenium(function(startSuccess) {
            if(!startSuccess) {
                done(false);
            }

            var cwd = path.resolve('./robot');

            var cmd = ['./runtests.py'];
            cmd.push('--variable GITHUB_USERNAME:' + githubUsername);
            cmd.push('--variable GITHUB_PASSWORD:' + githubPassword);

            if(server) {
                cmd.push('--variable SERVER:' + server);
            }

            cmd.push('tests/');

            cmd = cmd.join(' ');

            grunt.log.writeln('Executing command ' + cmd + ' in directory ' + cwd);
            require('child_process').exec(cmd, {cwd: cwd, timeout: 240000}, function (error, stdout, stderr) {
                var failed = false;
                if (error) {
                    grunt.log.writeln(stdout);
                    grunt.log.error('Tests FAILED');

                    failed = true;
                } else {
                    grunt.log.writeln(stdout);
                    grunt.log.ok('Tests passed');
                }

                stopSelenium(function(stopSuccess) {
                    require('child_process').exec("open report.html", {cwd: cwd, timeout: 3000}, function (error, stdout, stderr) {
                        if(!stopSuccess || failed) {
                            done(false);
                            return;
                        }

                        done(true);
                    });
                });
            });
        });
    });

    grunt.registerTask('backup-repositories', 'Backup repositories', function(dest) {
        if (arguments.length > 1) {
            grunt.log.error(this.name + ": Give max one argument, destination path");
            return;
        }

        function createBackupFilename() {
            var timestamp = (new Date()).toISOString().replace(/\:/g, '.'); // Linux can't handle ':'
            return "backup_repositories_" + timestamp + ".tar.gz";
        }

        dest = path.resolve(dest);
        var cwd = path.resolve();
        var repositoryPath = path.resolve(REPOSITORY_PATH);
        var relativeRepositoryPath = path.relative(cwd, repositoryPath);

        var backupFilename = createBackupFilename();
        var cmd = 'tar zcf "' + backupFilename + '" "' + relativeRepositoryPath + '"';
        var done = this.async();

        grunt.log.writeln('Backing up repositories from ' + relativeRepositoryPath + ' ' + dest);
        grunt.log.writeln('Executing command "' + cmd + '" in directory "' + cwd + '"');

        require('child_process').exec(cmd, {cwd: cwd}, function (error, stdout, stderr) {
            if (error) {
                grunt.log.writeln(stdout);
                grunt.log.writeln(stderr);
                grunt.log.error('Error creating tar.gz package');
                grunt.log.error(error);
                done(false);
            } else {
                grunt.log.writeln(stdout);
                grunt.log.writeln('Created package ' + backupFilename);

                var backupFilePackage = path.resolve(backupFilename);
                dest = path.join(dest, backupFilename);
                
                grunt.log.writeln('Copying package "' + backupFilePackage + '" to destination "' + dest + '"');
                grunt.file.copy(backupFilePackage, dest);

                grunt.log.writeln('Deleting local copy "' + backupFilePackage + '"');
                grunt.file.delete(backupFilePackage);

                grunt.log.writeln('Succesfully copied ' + backupFilename + ' files to ' + dest);
                grunt.log.ok('Backup was successful');

                done();
            }
        });
    });

    grunt.registerTask('create-repository', 'Create a new Github repository', function(repoName, username, password) {
        var GitHubApi = require("github");
        var done = this.async();

        var github = new GitHubApi({
            version: "3.0.0"
        });

        github.authenticate({
            type: "basic",
            username: username,
            password: password
        });

        github.repos.create({
            name: repoName
        }, function(err, newRepo) {
            if(err) {
                done(false);
                return;
            }

            github.repos.addCollaborator({
                user: username,
                repo: repoName,
                collabuser: 'dippa'
            }, function(err, res) {
                if(err) {
                    done(false);
                    return;
                }
                grunt.log.writeln(newRepo.html_url);
                done();
            });
        });
    });

    // Default task.
    grunt.registerTask('default', ['jshint', 'test']);
};
