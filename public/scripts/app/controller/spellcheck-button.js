define(['require'
    , 'jquery'
    , 'underscore'],

    function(require, $, _, editor) {

        "use strict";
        var spellchecking = false;

        $('#spellcheck_button').click(function () {
            var editor = require('app/controller/editor').instance;
            spellchecking = !spellchecking;

            if (spellchecking) {
                $(this).text('Disable spellchecking');
            } else {
                $(this).text('Enable spellchecking');
            }
            editor.enableSpellchecking(spellchecking);
        });
    });
