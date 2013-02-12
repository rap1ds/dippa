define(["app/module/bibtex-parser", "text!spec/bibtex-parser-fixtures.bib"], function(parser, bibtexFile) {

	describe('Bibtex Parser', function() {

		it('parser bibtex', function() {
			var parsedBibtex = parser(bibtexFile);

			expect(parsedBibtex).toEqual([ 
				{ title : 'schwaber2009agile', line : 1 }, 
				{ title : 'agilemanifesto', line : 10 }, 
				{ title : 'korkala2006', line : 17 }, 
				{ title : 'hannotaatio', line : 30 }, 
				{ title : 'kock2005', line : 37 }, 
				{ title : 'daft1986', line : 51 }, 
				{ title : 'kock2004', line : 70 }, 
				{ title : 'gummesson1999', line : 81 }, 
				{ title : 'mason2004', line : 91 }, 
				{ title : 'silverman2009doing', line : 103 }, 
				{ title : 'pichler2010', line : 113 }, 
				{ title : 'dennis1999', line : 122 }, 
				{ title : 'daft1987', line : 135 }, 
				{ title : 'graveline2000', line : 154 }, 
				{ title : 'higa2007', line : 166 }, 
				{ title : 'gu2011', line : 175 }, 
				{ title : 'nakamura1995', line : 186 }, 
				{ title : 'dennis1998', line : 198 }, 
				{ title : 'elshinnawy1997', line : 217 }, 
				{ title : 'dennis2008', line : 231 }, 
				{ title : 'kock2007', line : 250 }, 
				{ title : 'wake2002', line : 270 }, 
				{ title : 'derosa2004', line : 284 } ]);
		});
	});
});