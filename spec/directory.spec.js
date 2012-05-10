var Directory = require('../modules/directory');
var _ = require('underscore');
var fs = require('fs');
var Promise = require("promised-io/promise").Promise;
var CommandLine = require('../modules/commandline');
var path = require('path');

// Helpers
var CommonHelpers = require('./helpers').Common;
var waitsForPromise = CommonHelpers.waitsForPromise;
var spyOnPromise = CommonHelpers.spyOnPromise;

describe('Directory', function (){

    beforeEach(function() {
        this.addMatchers({
            toBePromise: function() {
                var p = this.actual;

                return _.isFunction(p.then) && _.isFunction(p.resolve) && _.isFunction(p.reject);
            },
            toBeFunction: function(){
                return _.isFunction(this.actual);
            },

            toBeRejected: function() {

            }
        });

        spyOn(fs, 'readFile');
        spyOn(fs, 'unlink');
    });

    function expectPromiseResults(promise, resolved, expectedArgs) {
        var promiseResolved = false;
        var promiseRejected = false;
        var promiseReturned = false;
        var actualArgs;

        promise.then(function() {
            actualArgs = _.toArray(arguments);
            promiseResolved = true;
            promiseReturned = true;
        }, function() {
            actualArgs = _.toArray(arguments);
            promiseRejected = true;
            promiseReturned = true;
        });

        waitsFor(function() {
            return promiseReturned;
        });

        runs(function() {
            if(resolved) {
                expect(promiseResolved).toBeTruthy();
                expect(promiseRejected).toBeFalsy();
            } else {
                expect(promiseResolved).toBeFalsy();
                expect(promiseRejected).toBeTruthy();
            }

            if(expectedArgs) {
                expect(actualArgs).toEqual(expectedArgs);
            }
        });
    }

    function expectResolved(promise, expectedArgs) {
        expectPromiseResults(promise, true, expectedArgs);
    }

    function expectRejected(promise, expectedArgs) {
        expectPromiseResults(promise, false, expectedArgs);
    }

    describe('readFile', function() {

        it('should return promise', function() {
            expect(Directory.readFile('1234', 'filename.txt')).toBePromise();
        });

        it('should call fs.readFile with repodir and filename', function() {
            Directory.readFile('1234', 'filename.txt');

            var args = fs.readFile.mostRecentCall.args

            expect(fs.readFile).toHaveBeenCalled();
            expect(args[0]).toEqual('./public/repositories_test//1234/filename.txt');
            expect(args[1]).toEqual('UTF-8');
            expect(args[2]).toBeFunction();
        });

        it('should resolve promise on success', function() {
            fs.readFile.andCallFake(function(file, enc, callback) {
                callback(null, {data: 'This is data'});
            });

            var promise = Directory.readFile('1234', 'filename.txt');

            expectResolved(promise, [{data: 'This is data'}]);
        });

        it('should reject promise on error', function() {
            fs.readFile.andCallFake(function(file, enc, callback) {
                callback({error: 'This is error'}, null);
            });

            var promise = Directory.readFile('1234', 'filename.txt');

            expectRejected(promise, [{error: 'This is error'}]);
        });
    });

    describe('deleteFile', function() {
        it('should return promise', function() {
            expect(Directory.deleteFile('1234', 'filename.txt')).toBePromise();
        });

        it('should call fs.unlink with repodir and filename', function() {
            Directory.deleteFile('1234', 'filename.txt');

            var args = fs.unlink.mostRecentCall.args

            expect(fs.unlink).toHaveBeenCalled();
            expect(args[0]).toEqual('./public/repositories_test//1234/filename.txt');
            expect(args[1]).toBeFunction();
        });

        it('should resolve promise on success', function() {
            fs.unlink.andCallFake(function(path, callback) {
                callback();
            });

            var promise = Directory.deleteFile('1234', 'filename.txt');

            waitsForPromise(promise);

            runs(function() {
                expect(promise.resolved).toBeTruthy();
            });
        });

        it('should reject promise on error', function() {
            fs.unlink.andCallFake(function(path, callback) {
                callback({error: 'this is error'});
            });

            var promise = Directory.deleteFile('1234', 'filename.txt');

            waitsForPromise(promise);

            runs(function() {
                expect(promise.rejected).toBeTruthy();
                expect(promise.result[0]).toEqual({error: 'this is error'});
            });
        });
    });

    describe('readDocumentFile', function() {
        it('should call readFile with id and document filename', function() {
            spyOn(Directory, 'readFile').andReturn(new Promise());

            expect(Directory.readDocumentFile(1234)).toBePromise();
            expect(Directory.readFile).toHaveBeenCalledWith(1234, 'dippa.tex');
        });
    });

    describe('readReferenceFile', function() {
        it('should call readFile with id and reference filename', function() {
            spyOn(Directory, 'readFile').andReturn(new Promise());

            expect(Directory.readReferenceFile(1234)).toBePromise();
            expect(Directory.readFile).toHaveBeenCalledWith(1234, 'ref.bib');
        });
    });

    describe('compile', function() {
        beforeEach(function() {
            this.runAllPromise = spyOnPromise(CommandLine, 'runAll').andCallRealSuccess("> commandline output");
        });

        it('calls commandline command to compile pdf', function() {
            var repoDir = '/home/mikko/repository';

            var promise = Directory.compile(repoDir);

            expect(promise).toBePromise();
            var commands = CommandLine.runAll.argsForCall[0][0];

            expect(commands[0].origCmd).toEqual('pdflatex --interaction=nonstopmode dippa');
            expect(commands[0].cwd).toEqual('/home/mikko/repository');
            expect(commands[1].origCmd).toEqual('bibtex dippa', '/home/mikko/repository');
            expect(commands[1].cwd).toEqual('/home/mikko/repository');
            expect(commands[2].origCmd).toEqual('pdflatex --interaction=nonstopmode dippa');
            expect(commands[2].cwd).toEqual('/home/mikko/repository');
            expect(commands[3].origCmd).toEqual('bibtex dippa', '/home/mikko/repository');
            expect(commands[3].cwd).toEqual('/home/mikko/repository');
            expect(commands[4].origCmd).toEqual('pdflatex --interaction=nonstopmode dippa');
            expect(commands[4].cwd).toEqual('/home/mikko/repository');

            waitsForPromise(promise);

            runs(function() {
                expect(promise.resolved).toBeTruthy();
                expect(promise.result[0]).toEqual("> commandline output");
            })
        });
    });

    describe('templateCommands', function() {

        beforeEach(function() {
            Directory.templatesAvailable = ['basic-essay', 'helsinki-university', 'aalto'];
            Directory.profile = {repoDir: '/home/mikko/repository', templateDir: './templates/'};
            spyOn(path, 'resolve').andCallFake(function(templateDir, template) {
                return path.normalize('/home/mikko/' + templateDir + '/' + template);
            });
        });

        it('returns template dir', function() {
            var templateDir = Directory.resolveTemplatePath('aalto');
            expect(templateDir).toEqual('/home/mikko/templates/aalto');
        });

        it('returns default (first) template dir if template is not given', function() {
            var templateDir = Directory.resolveTemplatePath(null);
            expect(templateDir).toEqual('/home/mikko/templates/basic-essay');
        });
    });

});