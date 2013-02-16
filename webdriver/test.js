"use strict";

var key = require('keyword');
var colorize = require('colorize');
var cconsole = colorize.console;

// Keywords
require('./keywords/assert-keywords');
require('./keywords/dippaeditor-keywords');
require('./keywords/fs-keywords');
require('./keywords/misc-keywords');
require('./keywords/screenshot-keywords');
require('./keywords/string-keywords');
require('./keywords/webdriver-common-keywords');
require('./keywords/webdriver-debug-keywords');

key.suite(require("./suite"));
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