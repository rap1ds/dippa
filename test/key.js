var _ = require('underscore');

var keywords = {};

function isDef(args) {
	return args.length >= 2 && _.isFunction(args[1]);
}

function isRun(args) {
	return _.every(_.initial(args), function(arg) {
		return _.isString(arg) || _.isArray(arg);
	}) && (_.isString(_.last(args)) || _.isArray(_.last(args)) || _.isObject(_.last(args)));
}

function isLib(args) {
	return args.length === 3 && _.isFunction(args[1]) && args[2] === true;
}

function isSuite(args) {
	return args.length === 1 && _.isObject(args[0]);
}

function isReturn(str) {
	return _.isString(str) && _.isString(pickReturnVar(str));
}

function pickReturnVar(str) {
	var regexp = /^\=>\s+\$(\w+)\s*$/; // equal sign, greater than sign, whitespace, dollar, var name
	var result = regexp.exec(str)
	return _.isObject(result) && result[1];
}

var localVars = (function() {

	var vars = {};

	function set(key, val) {
		console.log("Setting local variable '" + key + "': " + val);
		vars[key] = val;
	}

	function get(key) {
		console.log("Getting local variable '" + key + "': " + vars[key]);
		return vars[key];	
	}

	function remove(key) {
		console.log("Getting local variable '" + key + "': " + vars[key]);
		delete vars[key];
	}

	return {
		set: set,
		get: get,
		remove: remove
	}

});

function createKeywords(args) {
	var keys = [];
	for(var i = 0; i < args.length; i++) {
		var keyword = {name: args[i]};
		
		if(_.isArray(args[i + 1])) {
			i++;
			keyword.args = args[i];
		}

		if(isReturn(args[i + 1])) {
			i++;
			keyword.returnVar = pickReturnVar(args[i]);
		}
		keys.push(keyword);
	}
	return keys;
}

function def(args) {

	var name = _.first(args);
	var definition = _.first(_.rest(args));

	keywords[name] = function() {
		var args = _.toArray(arguments);
		var next = _.first(args);
		args = _.rest(args);

		definition.apply(null, [next].concat(args))
	};
}

function lib(args) {
	var name = _.first(args);
	var definition = _.first(_.rest(args));

	keywords[name] = function() {
		var args = _.toArray(arguments);
		var next = _.first(args);
		args = _.rest(args);
		var vars = _.last(args);
		args = _.initial(args);
		var keywordInfo = _.last(args);
		args = _.initial(args);

		console.log('Lib variables for key ', name);
		console.log('keywordInfo', keywordInfo);
		console.log('vars', vars);

		var callback = function(returnVal) {
			console.log('Keyword "' + name + '", callback info: ', JSON.stringify(args));
			/*
			if(keywordInfo.returnVar && returnVal) {
				vars.set(keywordInfo.returnVar, returnVal);
			}
			*/
			next(returnVal);
		}

		console.log('Calling def of keyword ' + name + " with args", JSON.stringify(args));
		var replacedArgs = replaceArgPlaceholders(args, vars);
		console.log('Calling def of keyword ' + name + " with REPLACED args", JSON.stringify(replacedArgs));

		definition.apply(null, [callback].concat(replacedArgs));
	}
}

function replaceArgPlaceholders(keywordArgs, vars) {
	var argNameRegexp = /^\$(\w+)$/;
	keywordArgs = keywordArgs || [];

	return keywordArgs.map(function(arg) {
		var res = argNameRegexp.exec(arg)
		if(_.isArray(res) && res.length === 2) {
			var argName = res[1];
			return vars.get(argName);
		} else {
			return arg;
		}
	});	
}

function run(args) {
	var vars = localVars();

	if(_.isObject(_.last(args))) {
		var passedArgs = _.last(args).arguments;

		// First is the 'next' callback
		passedArgs = _.rest(passedArgs);

		passedArgs.forEach(function(val, key) {
			if(val !== undefined) {
				vars.set(parseInt(key) + 1, val);
			}
		})

		args = _.initial(args);
	}

	var keywordsToRun = createKeywords(args);
	var thenCallback;

	function takeFirst() {
		var first = _.first(keywordsToRun);
		keywordsToRun = _.rest(keywordsToRun);
		return first;
	}

	function runKeyword(keyword) {
		if(!keyword) {
			debugger;
			var retVal = vars.get('return');
			vars.remove('return');
			return (thenCallback || _.identity)(retVal);
		}

		var def = keywords[keyword.name];

		function next(retVal) {
			console.log('Returned from ' + keyword.name + ', return value:', retVal);

			debugger;

			if(keyword.returnVar && retVal) {
				vars.set(keyword.returnVar, retVal);
			}

			runKeyword(takeFirst());
		}

		if(!def) {
			throw new Error("Can not find keyword '" + keyword.name + "'");
		}

		console.log('Calling def of keyword ' + keyword.name + " with args", JSON.stringify(keyword.args));
		var replacedArgs = replaceArgPlaceholders(keyword.args, vars);
		console.log('Calling def of keyword ' + keyword.name + " with REPLACED args", JSON.stringify(replacedArgs));

		var defArgs = [next].concat(replacedArgs);
		// var defArgs = [next].concat(keyword.args);
		defArgs.push(keyword);
		defArgs.push(vars);

		var defReturnVal = def.apply(null, defArgs);
	}

	_.defer(function() {
		runKeyword(takeFirst());
	});

	return {
		then: function(callback) {
			thenCallback = callback;
		}
	}
}

function suite(suiteObj) {
	_.forEach(suiteObj, function(keys, name) {
		var definitionFn = function(done) {
			console.log('Called keyword ' + name + ' definition with args', JSON.stringify(arguments));
			console.log('Calling following keys ', JSON.stringify(keys));

			// Save original args
			var args = _.toArray(arguments)
			var vars = _.last(args);
			args = _.initial(args);
			var keywordInfo = _.last(args);
			args = _.initial(args);
			keys.push({arguments: args});

			debugger;

			key.apply(null, keys).then(done);
		}
		def([name, definitionFn]);
	});
}

var running = false;

var key = function() {
	var args = _.toArray(arguments);

	if(isSuite(args)) {
		suite(_.first(args));
	}

	else if(isDef(args)) {
		return isLib(args) ? lib(args) : def(args);
	}

	else if(isRun(args)) {
		return run(args);
	}

	else {
		throw new Error("Illegal arguments: " + JSON.stringify(args));
	}
};

module.exports = key;