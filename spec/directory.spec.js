var Directory = require('../modules/directory');
var _ = require('underscore');
var fs = require('fs');
var Promise = require('node-promise').Promise;


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

        spyOn(fs, 'readFile')
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
            expect(args[0]).toEqual('./public/repositories//1234/filename.txt');
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

});