describe('Regexp', function() {

    var document = "" +
        "Plaa plaa\n" + // 0
        "\\section{1}\n" + // 1
        "Plöö plöö\n" + // 2
        "Plöö plöö\n" + // 3
        "\\subsection{1.1}\n" + // 4
        "\\subsection{1.2}\n" + // 5
        "\\subsection{1.3}\n" + // 6
        "\\subsubsection{1.3.1}\n" + // 7
        "\\subsubsection{1.3.2}\n" + // 8
        "\\subsubsection{1.3.3}\n" + // 9
        "\\subsubsubsection{1.3.3.1}\n" + // 10
        "\\subsubsubsubsection{1.3.3.1.1}\n" + // 11
        "\\subsubsection{1.3.4}\n" + // 12
        "\\subsection{1.4}\n" + // 13
        "Plöö plöö\n" + // 14
        "Plöö plöö\n" + // 15
        "Plöö plöö\n" + // 16
        "\\section{2}\n" + // 17
        "\\subsubsubsection{2.0.0.1}\n" + // 18
        "Plöö plöö\n" + // 19
        "\n" + // 20
        "\\section{3}\n" + // 21
        "\\section{4}\n" + // 22
        "\\section{5}\n" + // 23
        "Plöö plöö\n" + // 24
        "Plöö plöö\n" + // 25
        "Plöö plöö\n" + // 26
        "Plöö plöö\n" + // 27
        "Plöö plöö\n" + // 28
        "Plöö plöö\n" + // 29
        "Plöö plöö\n" + // 30
        "\n";

    it('should found (sub)sections', function() {
        var lines = document.split('\n');
        var len = lines.length;
        var outline = [];

        var findSections = /\\((?:sub)*)section\{(.*)\}/g;

        for(var i = 0; i < len; i++) {
            var line = lines[i];
            var result;
            while ((result = findSections.exec(line)) != null)
            {
                var section = {};
                section.title = result[2];
                section.level = result[1].length / 3; // 'sub'.length === 3
                section.line = i;

                outline.push(section);
            }
        }

        expect(outline[0]).toEqual({title: '1', level: 0, line: 1});
        expect(outline[1]).toEqual({title: '1.1', level: 1, line: 4});
        expect(outline[2]).toEqual({title: '1.2', level: 1, line: 5});
        expect(outline[3]).toEqual({title: '1.3', level: 1, line: 6});
        expect(outline[4]).toEqual({title: '1.3.1', level: 2, line: 7});
        expect(outline[5]).toEqual({title: '1.3.2', level: 2, line: 8});
        expect(outline[6]).toEqual({title: '1.3.3', level: 2, line: 9});
        expect(outline[7]).toEqual({title: '1.3.3.1', level: 3, line: 10});
        expect(outline[8]).toEqual({title: '1.3.3.1.1', level: 4, line: 11});
        expect(outline[9]).toEqual({title: '1.3.4', level: 2, line: 12});
        expect(outline[10]).toEqual({title: '1.4', level: 1, line: 13});
        expect(outline[11]).toEqual({title: '2', level: 0, line: 17});
        expect(outline[12]).toEqual({title: '2.0.0.1', level: 3, line: 18});
        expect(outline[13]).toEqual({title: '3', level: 0, line: 21});
        expect(outline[14]).toEqual({title: '4', level: 0, line: 22});
        expect(outline[15]).toEqual({title: '5', level: 0, line: 23});
    });

});