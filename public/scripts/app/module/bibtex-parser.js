define([], function() {
	"use strict";

	// var regexp = "@[a-zA-Z0-9]*\{([a-zA-Z0-9]*)\,";
	var regexp = /@[a-zA-Z0-9]*\s*\{\s*([a-zA-Z0-9]*)\s*\,/gi;

	function indexToLineNumber(index, str) {
		var sub = str.substring(0, index);
		return sub.split('\n').length;
	}

	/**
		Give string containing Bibtex document, get back
		array of objects:

		[{title: referenceid2013, line: 123}, ... ]

	*/
	function parse(bibtexDocument) {
		var results = [];
		var result;
		while ((result = regexp.exec(bibtexDocument)) != null) {
			results.push({title: result[1], line: indexToLineNumber(result.index, bibtexDocument)});
		}

		return results;
	}

	return parse;
});