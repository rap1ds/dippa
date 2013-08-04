"use strict";

var key = require('keyword');
var colorize = require('colorize');
var cconsole = colorize.console;

// Keywords
key(require('./keywords/assert-keywords'));
key(require('./keywords/dippaeditor-keywords'));
key(require('./keywords/fs-keywords'));
key(require('./keywords/misc-keywords'));
key(require('./keywords/screenshot-keywords'));
key(require('./keywords/string-keywords'));
key(require('./keywords/webdriver-common-keywords'));
key(require('./keywords/webdriver-debug-keywords'));
key(require("./suite"));

key.injector(key.webdriver);

var startTime = Date.now();
key.run(
    "Initialize",
    "Test Create Demo",
    "Test Basic Functions",
    "Quit"

    ).then(function() {
        var totalTime = (Date.now() - startTime) / 1000;
        cconsole.log('\n  #green[All done.]');
        cconsole.log('  #green[Took ' + totalTime + 's]\n');
});