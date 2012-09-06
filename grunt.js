/*global module:false*/
module.exports = function(grunt) {
    "use strict";

    var path = require('path');

    var REPOSITORY_PATH = 'public/repositories';

    // Project configuration.
    grunt.initConfig({
        lint: {
            files: ['server.js', 'grunt.js', 'fixtures/**/*.js', 'modules/**/*.js', 'spec/**/*.js']
        },
        test: {
            specs: 'spec/'
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint test'
        },
        jshint: {
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
                eqnull: true
            },
            globals: {
                jQuery: true
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
                grunt.log.error('Test runner exited with errors');
                done(false);
            } else {
                grunt.log.writeln(stdout);
                grunt.log.ok('Tests passed');
                done();
            }
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

        var dest = path.resolve(dest);
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

                grunt.log.writeln('Succesfully copied ' + backupFilename + ' files to ' + dest);
                grunt.log.ok('Backup was successful');

                done();
            }
        });

    });

    // Default task.
    grunt.registerTask('default', 'test');
};
