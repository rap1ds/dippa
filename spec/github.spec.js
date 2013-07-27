var Github = require('../public/scripts/github.js');

describe('Github', function() {
    "use strict";

    describe('parseRepositoryUrl', function() {

        var expectParse = function(url, owner, name) {
            var result = Github.parseRepositoryUrl(url);

            if(owner && name) {
                expect(result.owner).toEqual(owner);
                expect(result.name).toEqual(name);
            } else {
                expect(result).toBeUndefined();
            }
        };

        it('should parse www url', function() {
            var url, result;

            expectParse('https://github.com/rap1ds/dippa', 'rap1ds', 'dippa');
            expectParse('http://github.com/rap1ds/dippa', 'rap1ds', 'dippa');
            expectParse('http://github.com/rap1ds/dippa!');
            expectParse('https://github.com/rap1ds/dippa/pulls', 'rap1ds', 'dippa');
            expectParse('http://github.com/rap1ds/dippa/pulls', 'rap1ds', 'dippa');
            expectParse('https://github.com/rap1ds-/dippa/pulls', 'rap1ds-', 'dippa');
            expectParse('https://github.com/-rap1ds/dippa/pulls');
            expectParse('https://github.com/rap1ds----/dippa..---____..-.-.-./pulls', 'rap1ds----', 'dippa..---____..-.-.-.');
            expectParse('https://github.com/rap%!&1ds/dippa/pulls');
            expectParse('https://github.com/rap1ds!/dippa/pulls');
            expectParse('https://github.com/rap1ds/dippa!/pulls');
        });

        it('should parse https url', function() {
            expectParse('https://rap1ds@github.com/rap1ds/dippa.git', 'rap1ds', 'dippa');
            expectParse('https://-arifga@github.com/rap1ds/dippa.git');
            expectParse('https://rap!ds@github.com/rap1ds/dippa.git');
            expectParse('http://rap1ds@github.com/rap1ds/dippa.git');
            expectParse('https://rap1ds@github.com/rap1ds----/dippa..---____..-.-.-....git', 'rap1ds----', 'dippa..---____..-.-.-...');
            expectParse('https://rap1ds@github.com/rap%!&1ds/dippa.git');
            expectParse('https://rap1ds@github.com/rap1ds!/dippa.git');
            expectParse('https://rap1ds@github.com/rap1ds/dippa!.git');
        });

        it('should parse https url without username', function() {
            expectParse('https://github.com/rap1ds/dippa.git', 'rap1ds', 'dippa');
        });

        it('should parse ssh url', function() {
            var url = "git@github.com:rap1ds/dippa.git";

            expectParse('git@github.com:rap1ds/dippa.git', 'rap1ds', 'dippa');
            expectParse('git@github.com:rap1ds----/dippa..---____..-.-.-....git', 'rap1ds----', 'dippa..---____..-.-.-...');
            expectParse('git@github.com:rap%!&1ds/dippa.git');
            expectParse('git@github.com:rap1ds!/dippa.git');
            expectParse('git@github.com:rap1ds/dippa!.git');
        });

        it('should parse git read-only', function() {
            expectParse('git://github.com/rap1ds/dippa.git', 'rap1ds', 'dippa');
        });

    });
});