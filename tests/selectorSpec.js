describe('selector', function() {
  var selector = require('../js/modules/selector/selector.js');

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
    'raw' : '*',
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
      'raw' : 'P.bootstrap_p',
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
        'raw' : 'A',
        'tag' : 'A'
      },
      'ids' : [],
      'pseudoClasses' : [],
      'pseudoElements' : [],
      'nots' : [],
      'raw' : 'P',
      'tag' : 'P'
    }, {
      'attributes' : [{
        'property' : 'style',
        'value' : 'display: none',
        'behaviour' : 'equals',
        'operator' : '=',
        'raw' : 'style="display: none"'
      }, {
        'property' : 'style',
        'value' : 'lay: non',
        'behaviour' : 'contains',
        'operator' : '*=',
        'raw' : 'style*=\'lay: non\''
      }, {
        'property' : 'style',
        'value' : null,
        'behaviour' : 'present',
        'operator' : '',
        'raw' : 'style'
      }],
      'classes' : [],
      'ids' : ['bottom_div', 'bottom_div_2'],
      'pseudoClasses' : [],
      'pseudoElements' : [],
      'nots' : [],
      'raw' : 'DIV#bottom_div#bottom_div_2[style="display: none"][style*=\'lay: non\'][style]',
      'tag' : 'DIV'
    }],
    'raw' : 'SPAN#top_div.bootstrap_divs:nth-child(4)::first-line:not(P ~ A):not(DIV#bottom_div#bottom_div_2[style="display: none"][style*=\'lay: non\'][style])',
    'tag' : 'SPAN'
  }];

  it('should be able to parse a selector string', function() {
    var parsedSelector = selector.parse(selectorStr);
    expectToBeContained(parsedSelector, selectorObj);
  });

  it('should be able to add/remove selector types to/from a selector instance', function() {
    var parsedSelector = selector.parse(selectorStr);

    expect(parsedSelector[0].equalsTag('*')).toBeTruthy();
    parsedSelector[0].updateTag('SPAN');
    expect(parsedSelector[0].equalsTag('SPAN')).toBeTruthy();

    expect(parsedSelector[0].containsId('ID1')).toBeFalsy();
    parsedSelector[0].addId('ID1');
    expect(parsedSelector[0].containsId('ID1')).toBeTruthy();
    parsedSelector[0].removeId('ID1');
    expect(parsedSelector[0].containsId('ID1')).toBeFalsy();

    expect(parsedSelector[0].containsClass('CLASS1')).toBeFalsy();
    parsedSelector[0].addClass('CLASS1');
    expect(parsedSelector[0].containsClass('CLASS1')).toBeTruthy();
    parsedSelector[0].removeClass('CLASS1');
    expect(parsedSelector[0].containsClass('CLASS1')).toBeFalsy();

    expect(parsedSelector[0].containsPseudoElement('PE1')).toBeFalsy();
    parsedSelector[0].addPseudoElement('PE1');
    expect(parsedSelector[0].containsPseudoElement('PE1')).toBeTruthy();
    parsedSelector[0].removePseudoElement('PE1');
    expect(parsedSelector[0].containsPseudoElement('PE1')).toBeFalsy();

    expect(parsedSelector[0].containsPseudoClass('PC1')).toBeFalsy();
    parsedSelector[0].addPseudoClass('PC1');
    expect(parsedSelector[0].containsPseudoClass('PC1')).toBeTruthy();
    parsedSelector[0].removePseudoClass('PC1');
    expect(parsedSelector[0].containsPseudoClass('PC1')).toBeFalsy();

    expect(parsedSelector[0].containsAttribute('ATTR', '*=', 'VAL')).toBeFalsy();
    parsedSelector[0].addAttribute('ATTR', '*=', 'VAL');
    expect(parsedSelector[0].containsAttribute('ATTR', '*=', 'VAL')).toBeTruthy();
    parsedSelector[0].removeAttribute('ATTR', '*=', 'VAL');
    expect(parsedSelector[0].containsAttribute('ATTR', '*=', 'VAL')).toBeFalsy();

    var not = selector.parse('A')[0];
    expect(parsedSelector[0].containsNot(not)).toBeFalsy();
    parsedSelector[0].addNot(not);
    expect(parsedSelector[0].containsNot(not)).toBeTruthy();
    parsedSelector[0].removeNot(not);
    expect(parsedSelector[0].containsNot(not)).toBeFalsy();
  });
});
