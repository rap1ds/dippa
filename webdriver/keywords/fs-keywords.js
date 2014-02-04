"use strict";

var fs = require('fs');

module.exports = {
    "Read File": function(next, driver, file) {
        fs.readFile(file, 'utf-8', function (err, data) {
            if (err) { throw err; }

            next(data);
        });
    }
};