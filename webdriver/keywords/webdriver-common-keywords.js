"use strict";

var debug = require('../reporter').debug;

// TODO Copy-pasted to dippaeditor-keywords
function getPath(driver) {
    return driver.executeScript(function() {
        return window.location.pathname;
    });
}

function getHref(driver) {
    return driver.executeScript(function() {
        return window.location.href;
    });
}

module.exports = {
    "Set Window Size": function(next, driver, w, h) {
        var win = new driver.webdriver.WebDriver.Window(driver);
        win
        .setSize(w, h)
        .then(next);
    },

    "Close": function(next, driver) {
        driver.close().then(next);
    },

    "Switch To First Tab": function(next, driver) {
        driver.getAllWindowHandles()
        .then(function(handles) {
            if(!handles.length) { throw "No active windows"; }

            return driver.switchTo().window(handles[0]);
        })
        .then(next);
    },

    "Switch To Next Tab": function(next, driver) {
        var allHandles;

        function findNext(cur) {
            var next;

            return function(a, b) {
                if(a === cur) {
                    next = b;
                }

                if(a === next) {
                    return a;
                } else {
                    return b;
                }
            };
        }

        driver.getAllWindowHandles()
        .then(function(handles) {
            allHandles = handles;
            return driver.getWindowHandle();
        })
        .then(function(currentHandle) {
            var nextHandle = allHandles.reduce(findNext(currentHandle));

            if(nextHandle === currentHandle) {
                throw "Didn't find next window";
            }

            console.log("Switched to window from", currentHandle, "to", nextHandle);

            return driver.switchTo().window(nextHandle);
        })
        .then(next);
    },

    "Wait For Element Content To Be": function(next, driver, selector, expectedContent) {
        driver.wait(function() {
            return driver.executeScript(function(selector, expectedContent) {
                return window.$(selector).text() === expectedContent;
            }, selector, expectedContent);
        }, 30000).then(next);
    },

    "Has Element Class?": function(next, driver, selector, className) {
        return driver.executeScript(function(selector, className) {
            return window.$(selector).hasClass(className);
        }, selector, className)
        .then(function(hasClass) {
            debug('Has Class', hasClass);
            return hasClass;
        })
        .then(next);
    },

    "Click": function(next, driver, selector) {
        driver.findElement(driver.webdriver.By.css(selector)).click()
        .then(function() {
            debug('Clicked element by selector ' + selector);
        })
        .then(next);
    },

    "Is Element Present?": function(next, driver, selector) {
        driver
        .isElementPresent(driver.webdriver.By.css(selector))
        .then(next);
    },

    "Sleep": function(next, driver, ms) {
        debug("Waiting for " + (ms / 1000) + " s...");
        driver.sleep(ms).then(function() {
            debug("Waited " + (ms / 1000) + " s. Done.");
        }).then(next);
    },

    "Is Visible?": function(next, driver, selector) {
        return driver.executeScript(function(selector) {
            return window.$(selector).is(':visible');
        }, selector)
        .then(function(isVisible) {
            debug('Is visible?', isVisible);
            return isVisible;
        })
        .then(next);
    },

    "Press Button": function(next, driver, selector) {
        debug("Pressing button by selector", selector);
        driver
        .findElement(driver.webdriver.By.id(selector)).click()
        .then(next);
    },

    "Go To Page": function(next, driver, location) {
        driver.get(location).then(next);
    },

    "Refresh": function(next, driver) {
        getHref(driver)
        .then(function(href) {
            debug("Refreshing page...", href);
            return driver.get(href);
        })
        .then(function() {
            debug("Refreshing page done.");
        })
        .then(next);
    },

    "Quit": function(next, driver) {
        driver.quit().then(next);
    },

    "Wait For Hash Change": function(next, driver) {
        debug("Wait For Hash Change");

        getPath(driver)
        .then(function(oldpath) {
            debug("Path is now", oldpath, "Waiting for path to change");
            return driver.wait(function() {
                return getPath(driver)
                .then(function(pathname) {
                    if(oldpath !== pathname) {
                        debug("Path changed to", pathname);
                        return true;
                    }
                    return false;
                });
            }, 20000);
        })
        .then(next);
    },

    "Reload Page": function(next, driver) {
        driver
        .navigate()
        .refresh()
        .then(next);
    }
};