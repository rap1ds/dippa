/*globals describe:false, it:false, expect:false, beforeEach:false, afterEach:false, spyOn:false, expect:false, jasmine:false, waits:false, runs:false */ //Jasmine globals

/*globals Dippa:false */

describe('controllers', function() {
    "use strict";

    describe('SaveButton', function() {

        var saveButton, el;

        function expectEnabled() {
            expect(el.removeClass).toHaveBeenCalledWith('disabled');
            expect(el.removeAttr).toHaveBeenCalledWith('disabled');
            expect(saveButton.enabled).toEqual(true);
        }

        function expectDisabled() {
            expect(el.addClass).toHaveBeenCalledWith('disabled');
            expect(el.attr).toHaveBeenCalledWith('disabled', 'disabled');
            expect(saveButton.enabled).toEqual(false);
        }

        beforeEach(function() {
            saveButton = new Dippa.SaveButtonClass();
            el = saveButton.el = {
                button: jasmine.createSpy(),
                addClass: jasmine.createSpy().andReturn(this),
                attr: jasmine.createSpy().andReturn(this),
                removeClass: jasmine.createSpy().andReturn(this),
                removeAttr: jasmine.createSpy().andReturn(this)
            };
            spyOn(saveButton, 'sendRequest');
        });

        it('should reset to default mode', function() {
            saveButton.initialLoading();
            saveButton.stateDisable();
            expect(el.button).toHaveBeenCalledWith('reset');
            expectDisabled();
        });

        it('should be enabled', function() {
            saveButton.initialLoading();
            saveButton.stateEnable();
            expect(el.button).toHaveBeenCalledWith('enable');
            expectEnabled();
        });

        it('should change to saving mode', function() {
            saveButton.initialLoading();
            saveButton.stateSaving();
            expect(el.button).toHaveBeenCalledWith('saving');
            expectDisabled();
        });

        it('should enable button when document changed', function() {
            saveButton.initialLoading();
            saveButton.documentChanged();
            expectEnabled();
        });

        it('should be disabled by default and after initial load', function() {
            saveButton.documentChanged();
            saveButton.initialLoading();
            expectDisabled();
            saveButton.documentChanged();
            expectEnabled();
        });

        describe('complete', function() {
            it('should change to complete mode', function() {
                saveButton.stateComplete();
                expect(el.button).toHaveBeenCalledWith('complete');
                expectDisabled();
            });

            it('should reset back to default after a while', function() {
                saveButton.stateComplete(10);
                spyOn(saveButton, 'stateDisable');

                // Guard
                expect(saveButton.stateDisable).not.toHaveBeenCalled();

                waits(20);

                runs(function() {
                    expect(saveButton.stateDisable).toHaveBeenCalled();
                });
            });
        });

    });

    describe('Editor', function() {
        var editor;

        beforeEach(function() {
            editor = new Dippa.EditorClass();
        });

        it('should be defined', function() {
            expect(editor).not.toBeNull();
            expect(editor).not.toBeUndefined();
        });

        describe('updateContent', function() {
            var content;

            beforeEach(function() {
                spyOn(editor, 'getValue').andReturn('old content new value');
                spyOn(editor, 'getCursorPosition').andReturn({row: 10, column: 20});
                content = {value: 'old content old value'};
                editor.content = content;
                editor.updateContent();
            });

            it('should update current content', function() {
                expect(content.value).toEqual('old content new value');
            });

            it('should update cursor position', function() {
                expect(content.cursor).toEqual({row: 10, column: 20});
            });
        });

        describe('setMode', function() {
            var oldContent, newContent;

            beforeEach(function() {
                spyOn(editor, 'setChanged');
                spyOn(editor, 'updateContent');
                spyOn(editor, 'setValue');
                spyOn(editor, 'setCursorPosition');
                oldContent = {value: 'old content old value'};
                newContent = {value: 'new content'};
                newContent.cursor = {column: 10, row: 20};
                editor.content = oldContent;

                editor.setContent(newContent);
            });

            it('should update the old content value', function() {
                expect(editor.updateContent).toHaveBeenCalled();
            });

            it('should set the new content value', function() {
                expect(editor.content).toEqual(newContent);
            });

            it('should update the editor', function() {
                expect(editor.setValue).toHaveBeenCalledWith('new content');
            });

            it('should update the cursor position', function() {
                expect(editor.setCursorPosition).toHaveBeenCalledWith({column: 10, row: 20});
            });
        });

        describe('changeType', function() {

            beforeEach(function() {
                editor.docContent = {value: 'docContent'};
                editor.refContent = {value: 'refContent'};
                spyOn(editor, 'setContent');
            });

            it('should change to doc content', function() {
                editor.changeType('doc');
                expect(editor.setContent).toHaveBeenCalledWith(editor.docContent);
            });

            it('should change to ref content', function() {
                editor.changeType('ref');
                expect(editor.setContent).toHaveBeenCalledWith(editor.refContent);
            });
        });
    });

});