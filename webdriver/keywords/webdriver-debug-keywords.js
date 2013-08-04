"use strict";

var debug = require('../reporter').debug;

module.exports = {
    "Print Window Status": function(next, driver) {
        var allHandles;
        return driver.getAllWindowHandles()
            .then(function(handles) {
                allHandles = handles;
                return driver.getWindowHandle();
            })
            .then(function(currentHandle) {
                debug("All handles", allHandles);
                debug("Current handle", currentHandle);
            });
    }
};