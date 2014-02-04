var expect = require('expect.js'),
Browser = require('zombie'),
browser = new Browser();
var key = require('./key');
var _ = require('underscore');

key("Log", function(next, msg) {
	debugger;
	console.log('[LOG]', msg);
	expect(msg).to.be('12345-file-content');
	next(msg);
}, true);

key("Read File", function(next, filename) {
	console.log('Reading filename', filename);

	if(filename === "i_exists.txt") {
		next("12345-file-content");
	} else {
		next(false);
	}
}, true);

key("Go To Page", function(next, url) {
	console.log("Browser visiting page ", url);
	browser.visit(url, function () {
		console.log("Browser is now in ", url);
        next();
    });
}, true);

key("Get Id From URL", function(next) {
	next(browser.window.location.pathname.split('/')[1]);
}, true);

key("Should Be Valid Id", function(next, id) {
	expect(_.isString(id)).to.be(true);
	expect(/^\w{6,}$/.test(id)).to.be(true);
	next();
});

key("Press Button", function(next, selector) {
	browser.pressButton(selector, function() {
		next();
	});
}, true);

key("Wait For Hash Change", function(next) {
	browser.wait(function() {
		next();
	});
}, true);

key("Wait For Editor Initialized", function(next) {
	function editorInitialized(window) {
		var editor = window.require('app/controller/editor');
		if(editor && editor.instance) {
			return true;
		} else {
			return false;
		}
	}

	browser.maxWait = 500000;
	browser.wait(editorInitialized, function() {
		console.log(browser.evaluate("window.require('app/controller/editor').instance.session"));
		// next();
	})
})

key("Set Editor Value", function(next, value) {
	console.log(browser.evaluate("window.require('app/controller/editor').instance.setValue('" + value + "')"));
	next();
});

key("Get Editor Value", function() {
	var val = browser.evaluate("window.require('app/controller/editor').instance.editor.getValue()");
	next(val);
})

key(require("./keywords"));

describe('Test Basic Function', function() {
	it("Run test", function(done) {
		key("Test Basic Functions").then(done);
	});
});