describe("selector", function() {
  require = require('requiree')(require);
  var selector = require.dev('../js/modules/selector.js');

  /**
   * var selectorify - takes an array of Selectors/objects and straighten them up
   * in order to perform comparison on them after
   *
   * @param  {array} arr array of Selectors/objects
   * @returns {array} when all objects are selectorified
   */
  var selectorify = function(arr, deleteSelectorFuncs) {
    var selectorifyRecursive = function(obj) {
      for (var i in obj) {
        var value = obj[i];

        if (!value || 'object' !== typeof value) {
          // null? undefined? primitive? no need to manipulate
          continue;
        }

        if (Array.isArray(value)) {
          // array? recursively manipulate every item in array
          for (var j in value) {
            value[j] = selectorifyRecursive(value[j]);
          }
        } else {
          // object? needs to be selectorified as well. take care in next recursive
          obj[i] = selectorifyRecursive(value);
        }

      };

      if (!obj.tag) {
        // obj does not have 'tag' property? means it is not an object to selectorify
        return obj;
      }

      var finalObj = obj;
      if (0 !== obj.constructor.toString().indexOf('function Selector')) {
        // selectorify only when obj is not already a Selector instance
        finalObj = new selector.Selector(obj);
      }

      if (deleteSelectorFuncs) {
        // no need comparing functions in tests of objects
        delete finalObj.parse;
        delete finalObj.stringify;
      }

      return finalObj;
    };

    arr = arr.slice(0); // duplicate array, do not work on original
    for (var i in arr) {
      var obj = arr[i];
      arr[i] = selectorifyRecursive(obj);
    }

    return arr;
  };

  /**
   * var testSelector - takes a selector object a selector string and tests
   * whether selector module functions work properly or not
   *
   * @param  {object} selectorObj selector representation in object
   * @param {string} selectorStr selector representation in string
   * @param {boolean} selectorObjContainsHierarchy whether selector object contains hierarchy or not
   */
  var testSelector = function(selectorObj, selectorStr, selectorObjContainsHierarchy) {
    var str1 = selector.stringify(selectorObj);
    var str2 = selectorStr;

    expect(str1).toEqual(str2);

    var obj1 = selectorify(selectorObj, true);
    var obj2 = selectorify(selector.parse(selectorStr), true);

    expect(obj1[0]).toEqual(obj2[0]);

    var obj1 = selectorify(selectorObj);
    var obj2 = selectorify(selector.parse(selectorStr));

    // in case selector object contains hierarchy,
    // must use selector.stringify to make it work
    expect(selectorObjContainsHierarchy ?
      selector.stringify([selectorObj[0]]) :
      selectorObj[0].raw
    ).toEqual(obj2[0].stringify());
  };

  var selectorStr1 = '*';
  var selectorObj1 = [
    {
      'attributes' : [],
      'classes' : [],
      'ids' : [],
      'pseudos' : [],
      'raw' : '*',
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
      'raw' : '#ID.CLASS',
      'tag' : '*'
    }
  ];

  var selectorStr3 = 'P:hover:nth-child(3n)::wow > SPAN#qq:not(SPAN):not(*.z.a[style*="{1}"][xxx]) ~ P.sss';
  var selectorObj3 = [
    {
      'attributes' : [],
      'classes' : [],
      'ids' : [],
      'pseudos' : ['hover', 'nth-child(3n)', 'wow'],
      'raw' : 'P:hover:nth-child(3n)::wow',
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
            'raw' : 'SPAN',
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
            'raw' : '*.z.a[style*="{1}"][xxx]',
            'tag' : '*'
          }
        ],
        'raw' : 'SPAN#qq:not(SPAN):not(*.z.a[style*="{1}"][xxx])',
        'tag' : 'SPAN',
        'generalSibling' : {
          'attributes' : [],
          'classes' : ['sss'],
          'ids' : [],
          'pseudos' : [],
          'raw' : 'P.sss',
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
      'raw' : 'STYLE:empty.class1#id2[style="aaa:click"][style][style^=\'aaa\']',
      'tag' : 'STYLE'
    }
  ];

  it("should be able to stringify/parse a selector object/string (1)", function() {
    testSelector(selectorObj1, selectorStr1);
  });

  it("should be able to stringify/parse a selector object/string (2)", function() {
    testSelector(selectorObj2, selectorStr2);
  });

  it("should be able to stringify/parse a selector object/string (3)", function() {
    testSelector(selectorObj3, selectorStr3, true);
  });

  it("should be able to stringify/parse a selector object/string (4)", function() {
    testSelector(selectorObj4, selectorStr4);
  });

  it("should be able to stringify/parse a selector object/string (5)", function() {
    var selectorObj5 = selectorObj1.concat(selectorObj2.concat(selectorObj3.concat(selectorObj4)));
    var selectorStr5 = selectorStr1 + ', ' + selectorStr2 + ', ' + selectorStr3 + ', ' + selectorStr4;

    testSelector(selectorObj5, selectorStr5);
  });
});
