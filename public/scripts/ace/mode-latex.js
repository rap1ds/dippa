/**
 * Typo is a JavaScript implementation of a spellchecker using hunspell-style
 * dictionaries.
 */
 
/**
Copyright (c) 2011, Christopher Finke
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * The name of the author may not be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE AUTHOR FINKE BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * Typo constructor.
 *
 * @param {String} [dictionary] The locale code of the dictionary being used. e.g.,
 *                              "en_US". This is only used to auto-load dictionaries.
 * @param {String} [affData] The data from the dictionary's .aff file. If omitted
 *                           and the first argument is supplied, the .aff file will
 *                           be loaded automatically from lib/typo/dictionaries/[dictionary]/[dictionary].aff
 * @param {String} [wordsData] The data from the dictionary's .dic file. If omitted,
 *                             and the first argument is supplied, the .dic file will
 *                             be loaded automatically from lib/typo/dictionaries/[dictionary]/[dictionary].dic
 * @returns {Typo} A Typo object.
 */

var Typo = function (dictionary, affData, wordsData, settings) {
	settings = settings || {};

	/** Determines the method used for auto-loading .aff and .dic files. **/
	this.platform = settings.platform || "chrome";

	this.dictionary = null;

	this.rules = {};
	this.dictionaryTable = {};

	this.compoundRules = [];
	this.compoundRuleCodes = {};

	this.replacementTable = [];

	this.flags = settings.flags || {};

	if (dictionary) {
		this.dictionary = dictionary;

		if (this.platform == "chrome") {
			if (!affData) affData = this._readFile(chrome.extension.getURL("lib/typo/dictionaries/" + dictionary + "/" + dictionary + ".aff"));
			if (!wordsData) wordsData = this._readFile(chrome.extension.getURL("lib/typo/dictionaries/" + dictionary + "/" + dictionary + ".dic"));
		} else {
			var path = settings.dictionaryPath || '';
			if (!affData) affData = this._readFile(path + "/" + dictionary + "/" + dictionary + ".aff");
			if (!wordsData) wordsData = this._readFile(path + "/" + dictionary + "/" + dictionary + ".dic");
		}

		this.rules = this._parseAFF(affData);

		// Save the rule codes that are used in compound rules.
		this.compoundRuleCodes = {};

		for (var i = 0, _len = this.compoundRules.length; i < _len; i++) {
			var rule = this.compoundRules[i];

			for (var j = 0, _jlen = rule.length; j < _jlen; j++) {
				this.compoundRuleCodes[rule[j]] = [];
			}
		}

		// If we add this ONLYINCOMPOUND flag to this.compoundRuleCodes, then _parseDIC
		// will do the work of saving the list of words that are compound-only.
		if ("ONLYINCOMPOUND" in this.flags) {
			this.compoundRuleCodes[this.flags.ONLYINCOMPOUND] = [];
		}

		this.dictionaryTable = this._parseDIC(wordsData);

		// Get rid of any codes from the compound rule codes that are never used
		// (or that were special regex characters).  Not especially necessary...
		for (var i in this.compoundRuleCodes) {
			if (this.compoundRuleCodes[i].length == 0) {
				delete this.compoundRuleCodes[i];
			}
		}

		// Build the full regular expressions for each compound rule.
		// I have a feeling (but no confirmation yet) that this method of
		// testing for compound words is probably slow.
		for (var i = 0, _len = this.compoundRules.length; i < _len; i++) {
			var ruleText = this.compoundRules[i];

			var expressionText = "";

			for (var j = 0, _jlen = ruleText.length; j < _jlen; j++) {
				var character = ruleText[j];

				if (character in this.compoundRuleCodes) {
					expressionText += "(" + this.compoundRuleCodes[character].join("|") + ")";
				}
				else {
					expressionText += character;
				}
			}

			this.compoundRules[i] = new RegExp(expressionText, "i");
		}
	}

	return this;
};

Typo.prototype = {
	/**
	 * Loads a Typo instance from a hash of all of the Typo properties.
	 *
	 * @param object obj A hash of Typo properties, probably gotten from a JSON.parse(JSON.stringify(typo_instance)).
	 */

	load : function (obj) {
		for (var i in obj) {
			this[i] = obj[i];
		}

		return this;
	},

	/**
	 * Read the contents of a file.
	 *
	 * @param {String} path The path (relative) to the file.
	 * @param {String} [charset="ISO8859-1"] The expected charset of the file
	 * @returns string The file data.
	 */

	_readFile : function (path, charset) {
		if (!charset) charset = "UTF-8";

		var req = new XMLHttpRequest();
		req.open("GET", path, false);
		req.overrideMimeType("text/plain; charset=" + charset);
		req.send(null);

		return req.responseText;
	},

	/**
	 * Parse the rules out from a .aff file.
	 *
	 * @param {String} data The contents of the affix file.
	 * @returns object The rules from the file.
	 */

	_parseAFF : function (data) {
		var rules = {};

		// Remove comment lines
		data = this._removeAffixComments(data);

		var lines = data.split("\n");

		for (var i = 0, _len = lines.length; i < _len; i++) {
			var line = lines[i];

			var definitionParts = line.split(/\s+/);

			var ruleType = definitionParts[0];

			if (ruleType == "PFX" || ruleType == "SFX") {
				var ruleCode = definitionParts[1];
				var combineable = definitionParts[2];
				var numEntries = parseInt(definitionParts[3], 10);

				var entries = [];

				for (var j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
					var line = lines[j];

					var lineParts = line.split(/\s+/);
					var charactersToRemove = lineParts[2];

					var additionParts = lineParts[3].split("/");

					var charactersToAdd = additionParts[0];
					if (charactersToAdd === "0") charactersToAdd = "";

					var continuationClasses = this.parseRuleCodes(additionParts[1]);

					var regexToMatch = lineParts[4];

					var entry = {};
					entry.add = charactersToAdd;

					if (continuationClasses.length > 0) entry.continuationClasses = continuationClasses;

					if (regexToMatch !== ".") {
						if (ruleType === "SFX") {
							entry.match = new RegExp(regexToMatch + "$");
						}
						else {
							entry.match = new RegExp("^" + regexToMatch);
						}
					}

					if (charactersToRemove != "0") {
						if (ruleType === "SFX") {
							entry.remove = new RegExp(charactersToRemove  + "$");
						}
						else {
							entry.remove = charactersToRemove;
						}
					}

					entries.push(entry);
				}

				rules[ruleCode] = { "type" : ruleType, "combineable" : (combineable == "Y"), "entries" : entries };

				i += numEntries;
			}
			else if (ruleType === "COMPOUNDRULE") {
				var numEntries = parseInt(definitionParts[1], 10);

				for (var j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
					var line = lines[j];

					var lineParts = line.split(/\s+/);
					this.compoundRules.push(lineParts[1]);
				}

				i += numEntries;
			}
			else if (ruleType === "REP") {
				var lineParts = line.split(/\s+/);

				if (lineParts.length === 3) {
					this.replacementTable.push([ lineParts[1], lineParts[2] ]);
				}
			}
			else {
				// ONLYINCOMPOUND
				// COMPOUNDMIN
				// FLAG
				// KEEPCASE
				// NEEDAFFIX

				this.flags[ruleType] = definitionParts[1];
			}
		}

		return rules;
	},

	/**
	 * Removes comment lines and then cleans up blank lines and trailing whitespace.
	 *
	 * @param {String} data The data from an affix file.
	 * @return {String} The cleaned-up data.
	 */

	_removeAffixComments : function (data) {
		// Remove comments
		data = data.replace(/#.*$/mg, "");

		// Trim each line
		data = data.replace(/^\s\s*/m, '').replace(/\s\s*$/m, '');

		// Remove blank lines.
		data = data.replace(/\n{2,}/g, "\n");

		// Trim the entire string
		data = data.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

		return data;
	},

	/**
	 * Parses the words out from the .dic file.
	 *
	 * @param {String} data The data from the dictionary file.
	 * @returns object The lookup table containing all of the words and
	 *                 word forms from the dictionary.
	 */

	_parseDIC : function (data) {
		data = this._removeDicComments(data);

		var lines = data.split(/\r\n|\r|\n/g)
		var dictionaryTable = {};

		// The first line is the number of words in the dictionary.
		for (var i = 1, _len = lines.length; i < _len; i++) {
			var line = lines[i];

			var parts = line.split("/", 2);

			var word = parts[0];

			// Now for each affix rule, generate that form of the word.
			if (parts.length > 1) {
				var ruleCodesArray = this.parseRuleCodes(parts[1]);

				// Save the ruleCodes for compound word situations.
				if (!("NEEDAFFIX" in this.flags) || ruleCodesArray.indexOf(this.flags.NEEDAFFIX) == -1) {
					dictionaryTable[word] = ruleCodesArray;
				}

				for (var j = 0, _jlen = ruleCodesArray.length; j < _jlen; j++) {
					var code = ruleCodesArray[j];

					var rule = this.rules[code];

					if (rule) {
						var newWords = this._applyRule(word, rule);

						for (var ii = 0, _iilen = newWords.length; ii < _iilen; ii++) {
							var newWord = newWords[ii];

							dictionaryTable[newWord] = "";

							if (rule.combineable) {
								for (var k = j + 1; k < _jlen; k++) {
									var combineCode = ruleCodesArray[k];

									var combineRule = this.rules[combineCode];

									if (combineRule) {
										if (combineRule.combineable && (rule.type != combineRule.type)) {
											var otherNewWords = this._applyRule(newWord, combineRule);

											for (var iii = 0, _iiilen = otherNewWords.length; iii < _iiilen; iii++) {
												var otherNewWord = otherNewWords[iii];
												dictionaryTable[otherNewWord] = "";
											}
										}
									}
								}
							}
						}
					}

					if (code in this.compoundRuleCodes) {
						this.compoundRuleCodes[code].push(word);
					}
				}
			}
			else {
				dictionaryTable[word] = "";
			}
		}

		return dictionaryTable;
	},


	/**
	 * Removes comment lines and then cleans up blank lines and trailing whitespace.
	 *
	 * @param {String} data The data from a .dic file.
	 * @return {String} The cleaned-up data.
	 */

	_removeDicComments : function (data) {
		// I can't find any official documentation on it, but at least the de_DE
		// dictionary uses tab-indented lines as comments.

		// Remove comments
		data = data.replace(/^\t.*$/mg, "");

		return data;

		// Trim each line
		data = data.replace(/^\s\s*/m, '').replace(/\s\s*$/m, '');

		// Remove blank lines.
		data = data.replace(/\n{2,}/g, "\n");

		// Trim the entire string
		data = data.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

		return data;
	},

	parseRuleCodes : function (textCodes) {
		if (!textCodes) {
			return [];
		}
		else if (!("FLAG" in this.flags)) {
			return textCodes.split("");
		}
		else if (this.flags.FLAG === "long") {
			var flags = [];

			for (var i = 0, _len = textCodes.length; i < _len; i += 2) {
				flags.push(textCodes.substr(i, 2));
			}

			return flags;
		}
		else if (this.flags.FLAG === "num") {
			return textCode.split(",");
		}
	},

	/**
	 * Applies an affix rule to a word.
	 *
	 * @param {String} word The base word.
	 * @param {Object} rule The affix rule.
	 * @returns {String[]} The new words generated by the rule.
	 */

	_applyRule : function (word, rule) {
		var entries = rule.entries;
		var newWords = [];

		for (var i = 0, _len = entries.length; i < _len; i++) {
			var entry = entries[i];

			if (!entry.match || word.match(entry.match)) {
				var newWord = word;

				if (entry.remove) {
					newWord = newWord.replace(entry.remove, "");
				}

				if (rule.type === "SFX") {
					newWord = newWord + entry.add;
				}
				else {
					newWord = entry.add + newWord;
				}

				newWords.push(newWord);

				if ("continuationClasses" in entry) {
					for (var j = 0, _jlen = entry.continuationClasses.length; j < _jlen; j++) {
						var continuationRule = this.rules[entry.continuationClasses[j]];

						if (continuationRule) {
							newWords = newWords.concat(this._applyRule(newWord, continuationRule));
						}
						/*
						else {
							// This shouldn't happen, but it does, at least in the de_DE dictionary.
							// I think the author mistakenly supplied lower-case rule codes instead
							// of upper-case.
						}
						*/
					}
				}
			}
		}

		return newWords;
	},

	/**
	 * Checks whether a word or a capitalization variant exists in the current dictionary.
	 * The word is trimmed and several variations of capitalizations are checked.
	 * If you want to check a word without any changes made to it, call checkExact()
	 *
	 * @see http://blog.stevenlevithan.com/archives/faster-trim-javascript re:trimming function
	 *
	 * @param {String} aWord The word to check.
	 * @returns {Boolean}
	 */

	check : function (aWord) {
		// Remove leading and trailing whitespace
		var trimmedWord = aWord.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

		if (this.checkExact(trimmedWord)) {
			return true;
		}

		// The exact word is not in the dictionary.
		if (trimmedWord.toUpperCase() === trimmedWord) {
			// The word was supplied in all uppercase.
			// Check for a capitalized form of the word.
			var capitalizedWord = trimmedWord[0] + trimmedWord.substring(1).toLowerCase();

			if (this.hasFlag(capitalizedWord, "KEEPCASE")) {
				// Capitalization variants are not allowed for this word.
				return false;
			}

			if (this.checkExact(capitalizedWord)) {
				return true;
			}
		}

		var lowercaseWord = trimmedWord.toLowerCase();

		if (lowercaseWord !== trimmedWord) {
			if (this.hasFlag(lowercaseWord, "KEEPCASE")) {
				// Capitalization variants are not allowed for this word.
				return false;
			}

			// Check for a lowercase form
			if (this.checkExact(lowercaseWord)) {
				return true;
			}
		}

		return false;
	},

	/**
	 * Checks whether a word exists in the current dictionary.
	 *
	 * @param {String} word The word to check.
	 * @returns {Boolean}
	 */

	checkExact : function (word) {
		var ruleCodes = this.dictionaryTable[word];

		if (typeof ruleCodes === 'undefined') {
			// Check if this might be a compound word.
			if ("COMPOUNDMIN" in this.flags && word.length >= this.flags.COMPOUNDMIN) {
				for (var i = 0, _len = this.compoundRules.length; i < _len; i++) {
					if (word.match(this.compoundRules[i])) {
						return true;
					}
				}
			}

			return false;
		}
		else {
			if (this.hasFlag(word, "ONLYINCOMPOUND")) {
				return false;
			}

			return true;
		}
	},

	/**
	 * Looks up whether a given word is flagged with a given flag.
	 *
	 * @param {String} word The word in question.
	 * @param {String} flag The flag in question.
	 * @return {Boolean}
	 */

	hasFlag : function (word, flag) {
		if (flag in this.flags) {
			var wordFlags = this.dictionaryTable[word];

			if (wordFlags && wordFlags.indexOf(this.flags[flag]) !== -1) {
				return true;
			}
		}

		return false;
	},

	/**
	 * Returns a list of suggestions for a misspelled word.
	 *
	 * @see http://www.norvig.com/spell-correct.html for the basis of this suggestor.
	 * This suggestor is primitive, but it works.
	 *
	 * @param {String} word The misspelling.
	 * @param {Number} [limit=5] The maximum number of suggestions to return.
	 * @returns {String[]} The array of suggestions.
	 */

	alphabet : "",

	suggest : function (word, limit) {
		if (!limit) limit = 5;

		if (this.check(word)) return [];

		// Check the replacement table.
		for (var i = 0, _len = this.replacementTable.length; i < _len; i++) {
			var replacementEntry = this.replacementTable[i];

			if (word.indexOf(replacementEntry[0]) !== -1) {
				var correctedWord = word.replace(replacementEntry[0], replacementEntry[1]);

				if (this.check(correctedWord)) {
					return [ correctedWord ];
				}
			}
		}

		var self = this;
		self.alphabet = "abcdefghijklmnopqrstuvwxyz";

		/*
		if (!self.alphabet) {
			// Use the alphabet as implicitly defined by the words in the dictionary.
			var alphaHash = {};

			for (var i in self.dictionaryTable) {
				for (var j = 0, _len = i.length; j < _len; j++) {
					alphaHash[i[j]] = true;
				}
			}

			for (var i in alphaHash) {
				self.alphabet += i;
			}

			var alphaArray = self.alphabet.split("");
			alphaArray.sort();
			self.alphabet = alphaArray.join("");
		}
		*/

		function edits1(words) {
			var rv = [];

			for (var ii = 0, _iilen = words.length; ii < _iilen; ii++) {
				var word = words[ii];

				var splits = [];

				for (var i = 0, _len = word.length + 1; i < _len; i++) {
					splits.push([ word.substring(0, i), word.substring(i, word.length) ]);
				}

				var deletes = [];

				for (var i = 0, _len = splits.length; i < _len; i++) {
					var s = splits[i];

					if (s[1]) {
						deletes.push(s[0] + s[1].substring(1));
					}
				}

				var transposes = [];

				for (var i = 0, _len = splits.length; i < _len; i++) {
					var s = splits[i];

					if (s[1].length > 1) {
						transposes.push(s[0] + s[1][1] + s[1][0] + s[1].substring(2));
					}
				}

				var replaces = [];

				for (var i = 0, _len = splits.length; i < _len; i++) {
					var s = splits[i];

					if (s[1]) {
						for (var j = 0, _jlen = self.alphabet.length; j < _jlen; j++) {
							replaces.push(s[0] + self.alphabet[j] + s[1].substring(1));
						}
					}
				}

				var inserts = [];

				for (var i = 0, _len = splits.length; i < _len; i++) {
					var s = splits[i];

					if (s[1]) {
						for (var j = 0, _jlen = self.alphabet.length; j < _jlen; j++) {
							replaces.push(s[0] + self.alphabet[j] + s[1]);
						}
					}
				}

				rv = rv.concat(deletes);
				rv = rv.concat(transposes);
				rv = rv.concat(replaces);
				rv = rv.concat(inserts);
			}

			return rv;
		}

		function known(words) {
			var rv = [];

			for (var i = 0; i < words.length; i++) {
				if (self.check(words[i])) {
					rv.push(words[i]);
				}
			}

			return rv;
		}

		function correct(word) {
			// Get the edit-distance-1 and edit-distance-2 forms of this word.
			var ed1 = edits1([word]);
			var ed2 = edits1(ed1);

			var corrections = known(ed1).concat(known(ed2));

			// Sort the edits based on how many different ways they were created.
			var weighted_corrections = {};

			for (var i = 0, _len = corrections.length; i < _len; i++) {
				if (!(corrections[i] in weighted_corrections)) {
					weighted_corrections[corrections[i]] = 1;
				}
				else {
					weighted_corrections[corrections[i]] += 1;
				}
			}

			var sorted_corrections = [];

			for (var i in weighted_corrections) {
				sorted_corrections.push([ i, weighted_corrections[i] ]);
			}

			function sorter(a, b) {
				if (a[1] < b[1]) {
					return -1;
				}

				return 1;
			}

			sorted_corrections.sort(sorter).reverse();

			var rv = [];

			for (var i = 0, _len = Math.min(limit, sorted_corrections.length); i < _len; i++) {
				if (!self.hasFlag(sorted_corrections[i][0], "NOSUGGEST")) {
					rv.push(sorted_corrections[i][0]);
				}
			}

			return rv;
		}

		return correct(word);
	}
};

var dict = new Typo("en_US", null, null, {dictionaryPath: "./dict", platform: "web"});

ace.define('ace/mode/latex', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/lib/event_emitter', 'ace/mode/text', 'ace/tokenizer', 'ace/mode/latex_highlight_rules', 'ace/range'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var LatexHighlightRules = require("./latex_highlight_rules").LatexHighlightRules;
var Range = require("../range").Range;
var WorkerClient = require("../worker/worker_client").WorkerClient;
var EventEmitter = require("../lib/event_emitter").EventEmitter;

var SpellcheckTokenizer = function(defaultRules, flag) {
    var $tokenizer = new Tokenizer(defaultRules, flag);

    this.setMispelledWords = function (mispelled) {
        this.mispelledWords = mispelled;
        this.updateTokenizer();
    }

    this.updateTokenizer = function () {
        var rules = {};
        rules.comment = defaultRules.comment.slice();
        rules.start = defaultRules.start.slice();

        if (this.isSpellcheckingEnabled) {
            (this.mispelledWords || []).forEach(function (word) {
                rules.start.push({
                    token: "misspell",
                    merge: true,
                    regex: "\\b" + word + "\\b",
                    next: "start"
                });
            });
        }

        $tokenizer = new Tokenizer(rules, flag);
    }
    
    this.getLineTokens = function(line, startState) {
        return $tokenizer.getLineTokens(line, startState);
    }

    this.enableSpellchecking = function (enable) {
        this.isSpellcheckingEnabled = enable;
        this.updateTokenizer();
    }

    this.forceReloadTokenizer = function () {
        this._emit("update", { data: { first: 0 } });
    }
};
oop.implement(SpellcheckTokenizer.prototype, EventEmitter);
var spellcheckTokenizerInstance = new SpellcheckTokenizer(new LatexHighlightRules().getRules());

var regExpEscape = (function() {

  var regExpChars = [
    '\\',
    '^',
    '$',
    '*',
    '+',
    '?',
    '.',
    '(',
    ')',
    ':',
    '.',
    '=',
    '!',
    '|',
    '{',
    '}',
    ',',
    '[',
    ']'
  ];

  function isRegExpChar(char) {
    return regExpChars.indexOf(char) !== -1;
  }

  function pickRegExpChars(word) {
    return word
      .split('')
      .filter(isRegExpChar);
  }

  function hasNotOnlyRegExpChars(word) {
    return pickRegExpChars(word).length !== word.length;
  }

  function escapeChar(char) {
    return isRegExpChar(char) ? ('\\' + char) : char;
  }

  function escape(word) {
    return word.split('')
      .map(escapeChar)
      .join('');
  }

  return Object.freeze({
    hasNotOnlyRegExpChars: hasNotOnlyRegExpChars,
    escape: escape
  });

})();

var Mode = function() {
    this.$tokenizer = spellcheckTokenizerInstance;
};
oop.inherits(Mode, TextMode);

(function () {


    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        // This code is adapted from ruby.js
        var outdent = true;

        // LaTeX comments begin with % and go to the end of the line
        var commentRegEx = /^(\s*)\%/;

        for (var i = startRow; i <= endRow; i++) {
            if (!commentRegEx.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        if (outdent) {
            var deleteRange = new Range(0, 0, 0, 0);
            for (var i = startRow; i <= endRow; i++) {
                var line = doc.getLine(i);
                var m = line.match(commentRegEx);
                deleteRange.start.row = i;
                deleteRange.end.row = i;
                deleteRange.end.column = m[0].length;
                doc.replace(deleteRange, m[1]);
            }
        }
        else {
            doc.indentRows(startRow, endRow, "%");
        }
    };

    // There is no universally accepted way of indenting a tex document
    // so just maintain the indentation of the previous line
    this.getNextLineIndent = function(state, line, tab) {
        return this.$getIndent(line);
    };

    this.enableSpellChecking = function (enable, doc) {
        spellcheckTokenizerInstance.enableSpellchecking(enable);
        spellcheckTokenizerInstance.forceReloadTokenizer(0, doc.$lines.length);
    }

    this.createWorker = function(session) {

        function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function spellcheck(parseResult) {
            var text = parseResult.elements
                    .filter(function (el) {
                        return el.text
                    })
                    .map(function (el) {
                        return el.text.content;
                    })
                    .join(" ");

            var sections = parseResult.elements
                    .filter(function (el) {
                        return el.command && el.command.name === "section";
                    })
                    .map(function (el) {
                        var str = el.command.args.substr(1);
                        return str.substr(0, str.length - 1);
                    })
                    .join(" ");

            var splitted = splitWords(text.concat(sections));
            var result = splitted
              .filter(regExpEscape.hasNotOnlyRegExpChars)
              .map(regExpEscape.escape)

              // Do the spell check
              .map(function (word) { 
                return { word: word, correct: dict.check(word) } 
              });

            var mispelled = result
                .filter(function (res) {
                    return !res.correct;
                })
                .map(function (res) {
                    return res.word;
                });

            spellcheckTokenizerInstance.setMispelledWords(mispelled);
        }

    function splitWords(text) {
        text = text.replace(/,/g, " ");
        text = text.replace(/\./g, " ");
        text = text.replace(/\"/g, " ");
        text = text.replace(/\[/g, " ");
        text = text.replace(/\]/g, " ");
        text = text.replace(/\(/g, " ");
        text = text.replace(/\)/g, " ");
        text = text.replace(/ \- /g, " ");
        text = text.replace(/ \-\- /g, " ");
        text = text.replace(/\n/g, " ");
        text = text.replace(/;/g, " ");
        text = text.replace(/\?/g, " ");
        text = text.replace(/!/g, " ");
            
        return text.split(" ").filter(function(val) {
            return val.length > 0 && val !== " " && !isNumber(val);
        });
    }
    
            var worker = new WorkerClient(["ace"], "ace/mode/latex_worker", "LatexWorker");
            worker.attachToDocument(session.getDocument());

            var startSpellcheck = _.debounce(spellcheck, 2000);

            worker.on("parsed", function (e) {
           		startSpellcheck(e.data);
                session._emit("parsed", e.data);
            }.bind(this));

            return worker;
        };

}).call(Mode.prototype);

exports.Mode = Mode;

});

ace.define('ace/mode/latex_highlight_rules', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var LatexHighlightRules = function() {
    this.$rules = {
        "start": [{
            token : "comment",
            merge : true,
            regex : "\\\\begin{comment}",
            next : "comment"
        }, {
            // A tex command e.g. \foo
            token : "keyword",
            regex : "\\\\(?:[^a-zA-Z]|[a-zA-Z]+)",
        }, {
            // Curly and square braces
            token : "lparen",
            regex : "[[({]"
        }, {
            // Curly and square braces
            token : "rparen",
            regex : "[\\])}]"
        }, {
            // Inline math between two $ symbols
            token : "string",
            regex : "\\$(?:(?:\\\\.)|(?:[^\\$\\\\]))*?\\$"
        }, {
            // A comment. Tex comments start with % and go to
            // the end of the line
            token : "comment",
            regex : "%.*$"
        }],
        "comment" : [{
            token : "comment", // closing comment
            regex : ".*?\\\\end{comment}",
            merge : true,
            next : "start"
        }, {
            token : "comment", // comment spanning whole line
            merge : true,
            regex : ".+"
        }]
    };
};

oop.inherits(LatexHighlightRules, TextHighlightRules);

exports.LatexHighlightRules = LatexHighlightRules;


});
;
            (function() {
                window.ace.require(["ace/ace"], function(a) {
                    if (!window.ace)
                        window.ace = {};
                    for (var key in a) if (a.hasOwnProperty(key))
                        ace[key] = a[key];
                });
            })();
