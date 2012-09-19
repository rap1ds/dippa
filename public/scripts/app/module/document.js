define(['require', 'jquery'], function(require, $) {
    "use strict";

    function createContentState() {
        var content, flushedContent;

        var exports = Object.freeze({
            setContent: function(value) {
                content = value;
            },
            getContent: function() {
                return content;
            },
            flush: function() {
                flushedContent = content;
            },
            hasChanged: function() {
                return !_.isEqual(content, flushedContent);
            }
        });

        return exports;
    }

    var documentContent = createContentState();
    var referenceContent = createContentState();

    var exports = Object.freeze({
        setDocumentContent: documentContent.setContent,
        getDocumentContent: documentContent.getContent,
        setReferenceContent: referenceContent.setContent,
        getReferenceContent: referenceContent.getContent,
        flush: function() {
            _.invoke([documentContent, referenceContent], 'flush');
        },
        hasChanged: function() {
            return _.any([documentContent, referenceContent], function(content) {
                var changed = content.hasChanged();
                return changed;
            })
        }
    });

    return exports;

});