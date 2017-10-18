describe("selector", function() {
  var selector = require('../../stylib').selector;

  var selectorStr1 = '*';
  var selectorObj1 = [
    {
      'attributes' : [],
      'classes' : [],
      'ids' : [],
      'pseudos' : [],
      'selector' : '*',
      'tag' : '*'
    }
  ];

  var selectorStr2 = '#ID.CLASS';
  var selectorObj2 = [
    {
      'attributes' : [],
      'classes' : ['CLASS'],
      'ids' : ['ID'],
      'pseudos' : [],
      'selector' : '#ID.CLASS',
      'tag' : null
    }
  ];

  var selectorStr3 = 'P:hover:nth-child(3n)::wow > SPAN#qq:not(SPAN):not(*.z.a[style*="{1}"][xxx]) ~ P.sss';
  var selectorObj3 = [
    {
      'attributes' : [],
      'classes' : [],
      'ids' : [],
      'pseudos' : ['hover', 'nth-child(3n)', 'wow'],
      'selector' : 'P:hover:nth-child(3n)::wow',
      'tag' : 'P',
      'directChild' : {
        'attributes' : [],
        'classes' : [],
        'ids' : ['qq'],
        'pseudos' : [],
        'nots' : [
          {
            'attributes' : [],
            'classes' : [],
            'ids' : [],
            'pseudos' : [],
            'selector' : 'SPAN',
            'tag' : 'SPAN'
          },
          {
            'attributes' : [
              {
                'property' : 'style',
                'value' : '{1}',
                'behaviour' : 'contains',
                'operator' : '*=',
                'raw' : 'style*="{1}"'
              },
              {
                'property' : 'xxx',
                'value' : null,
                'behaviour' : 'present',
                'operator' : '',
                'raw' : 'xxx'
              }
            ],
            'classes' : ['z', 'a'],
            'ids' : [],
            'pseudos' : [],
            'selector' : '*.z.a[style*="{1}"][xxx]',
            'tag' : '*'
          }
        ],
        'selector' : 'SPAN#qq:not(SPAN):not(*.z.a[style*="{1}"][xxx])',
        'tag' : 'SPAN',
        'generalSibling' : {
          'attributes' : [],
          'classes' : ['sss'],
          'ids' : [],
          'pseudos' : [],
          'selector' : 'P.sss',
          'tag' : 'P'
        }
      }
    }
  ];

  var selectorStr4 = 'STYLE:empty.class1#id2[style="aaa:click"][style][style^=\'aaa\']';
  var selectorObj4 = [
    {
      'attributes' : [
        {
          'property' : 'style',
          'value' : 'aaa:click',
          'behaviour' : 'equals',
          'operator' : '=',
          'raw' : 'style="aaa:click"'
        },
        {
          'property' : 'style',
          'value' : 'aaa',
          'behaviour' : 'beginsWith',
          'operator' : '^=',
          'raw' : 'style^=\'aaa\''
        },
        {
          'property' : 'style',
          'value' : null,
          'behaviour' : 'present',
          'operator' : '',
          'raw' : 'style'
        },
      ],
      'classes' : ['class1'],
      'ids' : ['id2'],
      'pseudos' : ['empty'],
      'selector' : 'STYLE:empty.class1#id2[style="aaa:click"][style][style^=\'aaa\']',
      'tag' : 'STYLE'
    }
  ];

  it("should be able to stringify/parse a selector object/string (1)", function() {
    var str1 = selector.stringify(selectorObj1);
    var str2 = selectorStr1;
    var obj1 = selectorObj1;
    var obj2 = selector.parse(selectorStr1);

    expect(str1).toEqual(str2);
    expect(obj1).toEqual(obj2);
  });

  it("should be able to stringify/parse a selector object/string (2)", function() {
    var str1 = selector.stringify(selectorObj2);
    var str2 = selectorStr2;
    var obj1 = selectorObj2;
    var obj2 = selector.parse(selectorStr2);

    expect(str1).toEqual(str2);
    expect(obj1).toEqual(obj2);
  });

  it("should be able to stringify/parse a selector object/string (3)", function() {
    var str1 = selector.stringify(selectorObj3);
    var str2 = selectorStr3;
    var obj1 = selectorObj3;
    var obj2 = selector.parse(selectorStr3);

    expect(str1).toEqual(str2);
    expect(obj1).toEqual(obj2);
  });

  it("should be able to stringify/parse a selector object/string (4)", function() {
    var str1 = selector.stringify(selectorObj4);
    var str2 = selectorStr4;
    var obj1 = selectorObj4;
    var obj2 = selector.parse(selectorStr4);

    expect(str1).toEqual(str2);
    expect(obj1).toEqual(obj2);
  });
});
