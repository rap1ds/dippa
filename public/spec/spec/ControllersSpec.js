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