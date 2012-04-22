var API = require('../modules/api');
var Directory = require('../modules/directory');

// Helpers
var CommonHelpers = require('./helpers').Common;
var waitsForPromise = CommonHelpers.waitsForPromise;
var spyOnPromise = CommonHelpers.spyOnPromise;

describe('API', function() {
    var req, res, next;

    beforeEach(function() {
        req = {};
        req.params = {};
        res = {};
        res.send = jasmine.createSpy('res.send');
        next = jasmine.createSpy('next');

        // Id
        req.params.id = '1234';
    });

    describe('getLoad', function() {
        var readDocFileSpy, readRefFileSpy;

        beforeEach(function() {
            readDocFileSpy = spyOnPromise(Directory, 'readDocumentFile');
            readRefFileSpy = spyOnPromise(Directory, 'readReferenceFile');
        });

        it('should call readDocumentFile and readReferenceFile', function() {
            readDocFileSpy.andCallRealSuccess();
            readRefFileSpy.andCallRealSuccess();

            API.getLoad(req, res, next);

            expect(Directory.readDocumentFile).toHaveBeenCalledWith('1234');
            expect(Directory.readReferenceFile).toHaveBeenCalledWith('1234');
        });

        it('should return 500 if an error occures', function() {
            var refPromise = readRefFileSpy.andCallRealSuccess();
            var docPromise = readDocFileSpy.andCallRealError();

            API.getLoad(req, res, next);

            waitsForPromise(refPromise);
            waitsForPromise(docPromise);

            runs(function() {
                expect(res.send).toHaveBeenCalledWith({msg: 'An error occured while reading content'}, 500);
            });
        });

        it('should return 200 with the proper body content', function() {
            var refPromise = readRefFileSpy.andCallRealSuccess("these are the references");
            var docPromise = readDocFileSpy.andCallRealSuccess("this is the latex doc");

            API.getLoad(req, res, next);

            waitsForPromise(refPromise);
            waitsForPromise(docPromise);

            runs(function() {
                expect(res.send).toHaveBeenCalledWith({documentContent: "this is the latex doc", referencesContent: "these are the references"});
            });
        });
    });

    describe('deleteUploadedFile', function() {
        var deleteFileSpy;

        beforeEach(function() {
            deleteFileSpy = spyOnPromise(Directory, 'deleteFile');
        });

        it('should call Directory.deleteUploadedFile', function() {
            deleteFileSpy.andCallRealSuccess();
            req.params.filename = 'filetodelete.txt';

            API.deleteUploadedFile(req, res, next);

            expect(Directory.deleteFile).toHaveBeenCalledWith('1234', 'filetodelete.txt');
        });

        it('should return 400 Bad Request if id or filename is not given', function() {
            deleteFileSpy.andCallRealError();
            API.deleteUploadedFile(req, res, next);
            expect(res.send).toHaveBeenCalledWith({msg: 'Missing filename or id'}, 400);
        });

        it('should return 500 if promise is rejected', function() {
            var promise = deleteFileSpy.andCallRealError();

            API.deleteUploadedFile(req, res, next);

            waitsForPromise(promise);

            runs(function() {
                expect(res.send).toHaveBeenCalledWith({msg: 'An error occured while deleting file'}, 500);
            });
        });

        it('should return 204 No Content if successfully deleted', function() {
            var promise = deleteFileSpy.andCallRealSuccess();
            req.params.filename = 'deleteme.txt';

            API.deleteUploadedFile(req, res, next);

            waitsForPromise(promise);

            runs(function() {
                expect(res.send).toHaveBeenCalledWith(204);
            });
        });

    });

});