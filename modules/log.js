var _ = require('underscore');
var loggly = require('loggly');
var config = require('../config');
var logglyConfig = { subdomain: "dippaeditor" };
var client = loggly.createClient(logglyConfig);
var log;
var profile = 'development';

var stringify = function(args) {
    "use strict";

    return _.toArray(args).map(function(arg) {
        if(_.isArray(arg)) {

            // Array as "[value1, value2, value3]"
            return '[' + arg.join(', ') + ']';

        } else if (_.isObject(arg)) {

            // Object as "{key1: value1, key2: value2}"
            return '{' + _.map(arg, function(value, key) {
                return key + ': ' + value;
            }).join(', ') + '}';

        } else {

            // Everything else as-is
            return arg;
        }
    }).join(', ');
};

function addDate(str) {
    "use strict";

    return [(new Date()).toISOString(), str].join(' ');
}

log = function () {
    "use strict";

    var msg = addDate(stringify(arguments));
    log.profiles[profile].log(msg);
};

log.error = function () {
    "use strict";

    var msg = addDate(stringify(arguments));
    log.profiles[profile].error(msg);
};

function sendToLoggly(msg) {
    "use strict";

    if(!config.loggly.token) {
        throw "No config.loggly.token";
    }

    client.log(config.loggly.token, msg);
}

var logglyLogger = {
    log: sendToLoggly,
    error: sendToLoggly
};

var consoleLogger = {
    log: console.log,
    error: console.error
};

log.profiles = {
    development: consoleLogger,
    test: consoleLogger,
    staging: consoleLogger,
    production: logglyLogger
};

log.init = function() {
    "use strict";
    
    profile = config.profile;
    log("Initialized logging with profile " + profile);
};

log.init();

module.exports = log;