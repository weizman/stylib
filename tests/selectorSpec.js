describe('selector', function() {
  var selector = require('../js/modules/selector/selector');

  var expectToBeContained = function(obj1, obj2) {
    for (var prop in obj2) {
      if ('object' === typeof obj1[prop]) {
        expect(obj2[prop]).toBeDefined();
        expectToBeContained(obj1[prop], obj2[prop]);
      } else {
        expect(obj1[prop]).toEqual(obj2[prop]);
      }
    }
  };

  var selectorStr = '*, SPAN#top_div.bootstrap_divs:nth-child(4)::first-line:not(P ~ A):not(DIV#bottom_div#bottom_div_2[style="display: none"][style*=\'lay: non\'][style]) > P.bootstrap_p';
  var selectorObj = [{
    'attributes' : [],
    'classes' : [],
    'ids' : [],
    'pseudoClasses' : [],
    'pseudoElements' : [],
    'nots' : [],
    '_raw' : '*',
    'tag' : '*'
  }, {
    'attributes' : [],
    'classes' : ['bootstrap_divs'],
    'directChild' : {
      'attributes' : [],
      'classes' : ['bootstrap_p'],
      'ids' : [],
      'pseudoClasses' : [],
      'pseudoElements' : [],
      'nots' : [],
      '_raw' : 'P.bootstrap_p',
      'tag' : 'P'
    },
    'ids' : ['top_div'],
    'pseudoClasses' : ['nth-child(4)'],
    'pseudoElements' : ['first-line'],
    'nots' : [{
      'attributes' : [],
      'classes' : [],
      'generalSibling' : {
        'attributes' : [],
        'classes' : [],
        'ids' : [],
        'pseudoClasses' : [],
        'pseudoElements' : [],
        'nots' : [],
        '_raw' : 'A',
        'tag' : 'A'
      },
      'ids' : [],
      'pseudoClasses' : [],
      'pseudoElements' : [],
      'nots' : [],
      '_raw' : 'P',
      'tag' : 'P'
    }, {
      'attributes' : [{
        'property' : 'style',
        'value' : 'display: none',
        'behaviour' : 'equals',
        'operator' : '=',
        '_raw' : 'style="display: none"'
      }, {
        'property' : 'style',
        'value' : 'lay: non',
        'behaviour' : 'contains',
        'operator' : '*=',
        '_raw' : 'style*=\'lay: non\''
      }, {
        'property' : 'style',
        'value' : null,
        'behaviour' : 'present',
        'operator' : '',
        '_raw' : 'style'
      }],
      'classes' : [],
      'ids' : ['bottom_div', 'bottom_div_2'],
      'pseudoClasses' : [],
      'pseudoElements' : [],
      'nots' : [],
      '_raw' : 'DIV#bottom_div#bottom_div_2[style="display: none"][style*=\'lay: non\'][style]',
      'tag' : 'DIV'
    }],
    '_raw' : 'SPAN#top_div.bootstrap_divs:nth-child(4)::first-line:not(P ~ A):not(DIV#bottom_div#bottom_div_2[style="display: none"][style*=\'lay: non\'][style])',
    'tag' : 'SPAN'
  }];

  it('should be able to parse a selector string', function() {
    var parsedSelector = selector.parse(selectorStr);

    expectToBeContained(parsedSelector, selectorObj);
  });

  it('should be able to add/remove selector types to/from a selector instance', function() {
    var parsedSelector = selector.parse(selectorStr);

    expect(parsedSelector[0].isTag('*')).toBeTruthy();
    parsedSelector[0].set('tag', 'SPAN');
    expect(parsedSelector[0].isTag('SPAN')).toBeTruthy();

    expect(parsedSelector[0].contains('id', 'ID1')).toBeFalsy();
    parsedSelector[0].set('id', 'ID1');
    expect(parsedSelector[0].contains('id', 'ID1')).toBeTruthy();
    parsedSelector[0].remove('id', 'ID1');
    expect(parsedSelector[0].contains('id', 'ID1')).toBeFalsy();

    expect(parsedSelector[0].contains('class', 'CLASS1')).toBeFalsy();
    parsedSelector[0].set('class', 'CLASS1');
    expect(parsedSelector[0].contains('class', 'CLASS1')).toBeTruthy();
    parsedSelector[0].remove('class', 'CLASS1');
    expect(parsedSelector[0].contains('class', 'CLASS1')).toBeFalsy();

    expect(parsedSelector[0].contains('pseudoElement', 'PE1')).toBeFalsy();
    parsedSelector[0].set('pseudoElement', 'PE1');
    expect(parsedSelector[0].contains('pseudoElement', 'PE1')).toBeTruthy();
    parsedSelector[0].remove('pseudoElement', 'PE1');
    expect(parsedSelector[0].contains('pseudoElement', 'PE1')).toBeFalsy();

    expect(parsedSelector[0].contains('pseudoClass', 'PC1')).toBeFalsy();
    parsedSelector[0].set('pseudoClass', 'PC1');
    expect(parsedSelector[0].contains('pseudoClass', 'PC1')).toBeTruthy();
    parsedSelector[0].remove('pseudoClass', 'PC1');
    expect(parsedSelector[0].contains('pseudoClass', 'PC1')).toBeFalsy();

    expect(parsedSelector[0].contains('attribute', 'ATTR', '*=', 'VAL')).toBeFalsy();
    parsedSelector[0].set('attribute', 'ATTR', '*=', 'VAL');
    expect(parsedSelector[0].contains('attribute', 'ATTR', '*=', 'VAL')).toBeTruthy();
    parsedSelector[0].remove('attribute', 'ATTR', '*=', 'VAL');
    expect(parsedSelector[0].contains('attribute', 'ATTR', '*=', 'VAL')).toBeFalsy();

    var not = selector.parse('A')[0];
    expect(parsedSelector[0].contains('not', not)).toBeFalsy();
    parsedSelector[0].set('not', not);
    expect(parsedSelector[0].contains('not', not)).toBeTruthy();
    parsedSelector[0].remove('not', not);
    expect(parsedSelector[0].contains('not', not)).toBeFalsy();
  });
});
