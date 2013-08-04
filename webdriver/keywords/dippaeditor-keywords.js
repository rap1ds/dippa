"use strict";

var _ = require('underscore');
var debug = require('../reporter').debug;
var assert = require('assert');

// TODO Copy-pasted from webdriver-common-keywords
function getPath(driver) {
    return driver.executeScript(function() {
        return window.location.pathname;
    });
}

module.exports = {

    "Get Preview ID": function(next, driver) {
        driver.executeScript(function() {
            return window.require('app/session').previewId;
        }).then(next);
    },

    "Go To Line": function(next, driver, lineNum) {
        driver.executeScript(function(lineNum) {
            return window.require('app/controller/editor')
            .instance
            .setCursorPosition({column: 0, row: lineNum});
        }, lineNum).then(next);
    },

    "Insert": function(next, driver, text) {
        driver.executeScript(function(text) {
            return window.require('app/controller/editor')
            .instance
            .editor.insert(text);
        }, text).then(next);
    },

    "Get Editor Value": function(next, driver) {
        driver.executeScript(function() {
            return window.require('app/controller/editor').instance.getValue();
        }).then(function(value) {
            return value;
        }).then(next);
    },

    "Set Editor Value": function(next, driver, value) {
        debug("Setting editor value to", value);
        driver.executeScript(function(value) {
            return window.require('app/controller/editor').instance.setValue(value);
        }, value).then(next);
    },

    "Should Be Valid Id": function(next, driver, id) {
        debug("Checking validity of id", id);
        assert(/^[A-Za-z0-9_\-]{6,}$/.test(id), "Is invalid id");
        next();
    },

    "Get Id From URL": function(next, driver) {
        getPath(driver)
        .then(function(path) {
            return path.split('/')[1];
        }).then(next);
    },

    "Wait For Editor Initialized": function(next, driver) {
        driver.wait(function() {
            return driver.executeScript(function() {
                try {
                    return window.require('app/controller/editor').instance.getValue();
                } catch (e) {
                    return null;
                }
            }).then(function(value) {
                return _.isString(value) && !_.isEmpty(value);
            });
        }, 5000).then(next);
    }
};