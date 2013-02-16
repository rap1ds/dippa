var _ = require('underscore');
var clc = require('cli-color');

function debug() {
    function indent(msg) {
        return msg.split("\n")
            .map(function(line) {
                return "  " + line;
            })
            .join("\n");
    }

    var msg = _.toArray(arguments).join(' ');
    var debugMsgStyle = clc.xterm(240);
    console.log(indent(debugMsgStyle(msg)));
}

function screenshot(filename) {
    console.log(clc.yellow("❏ Taking screenshot " + filename));
}

function assertOk(msg) {
    console.log(clc.green('✓ ' + msg));
}

function assertFail(msg) {
    console.log(clc.red('✓ ' + msg));
}

module.exports = {
    debug: debug,
    screenshot: screenshot,
    assertOk: assertOk,
    assertFail: assertFail
};