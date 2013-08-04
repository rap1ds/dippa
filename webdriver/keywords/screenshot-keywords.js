"use strict";

var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var q = require('q');
var logScreenshot = require('../reporter').screenshot;
var fs = require('fs');

var SCREENSHOTS_DIR = "./screenshots";

module.exports = {
    "Take Screenshot": (function counter() {
        
        var i = 0;

        function pad(num) {
            if(num < 10) {
                return '00' + num;
            }
            else if(num < 100) {
                return '0' + num;
            }
            else {
                return '' + num;
            }
        }

        return function(next, driver, filename) {
            i++;
            driver.takeScreenshot()
                .then(function(base64png) {
                    return q.nfcall(mkdirp, SCREENSHOTS_DIR).then(function() {
                        var fullFilename = pad(i) + '_' + filename + '.png';
                        logScreenshot(fullFilename);
                        return q.nfcall(fs.writeFile, SCREENSHOTS_DIR + '/' + fullFilename , base64png, 'base64');
                    });
                })
                .then(next);
            };
        })(),


    "Delete Screenshots": function(next) {
        rimraf(SCREENSHOTS_DIR, function(err) {
            if(err) { throw err; }
            next();
        });
    }
};