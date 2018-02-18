var string = require('../../utils/string');
var parser = require('./parser.js');

/**
 * Selector - constructor of Selector type
 *
 * @param  {object} selectorObj
 * @returns {Selector}
 */
function Selector(selectorObj) {
  for (var prop in selectorObj) {
    this[prop] = selectorObj[prop];
  }

  this.stringify = stringify.bind(null, [selectorObj]);
  this.parse = parse.bind(null, selectorObj.raw);
};

/**
 * var parse - convert selector string into the selector's representation as an array
 *
 * @param  {string} str
 * @returns {array} array of Selectors
 */
var parse = function(str) {
  var arr = []; // will include all selector's components

  var selectors = str.split(','); // ',' sepperates between different general sub selectors
  for (var i in selectors) {
    var selector = selectors[i];

    if (!selector) {
      continue;
    }

    var obj = {};

    selector = string.trim(selector);
    obj['raw'] = selector.split(' ')[0]; // sub selector hierarchy components are separated by ' '

    obj['tag'] = parser.getTag(selector) || '*';

    var ret = parser.splitByHierarchy(selector);
    if (ret) {
      var bfrSelector = ret[0];
      var hierarchyKind = ret[1];
      var afrSelector = ret[2];

      obj[hierarchyKind] = parse(afrSelector)[0]; // parse the next hierarchy component

      // only the selector of before the operator occurence should be extracted for information
      selector = bfrSelector;
    }

    obj['ids'] = parser.getIds(selector);
    obj['classes'] = parser.getClasses(selector);
    obj['pseudoElements'] = parser.getPseudoElements(selector);
    obj['pseudoClasses'] = parser.getPseudoClasses(selector);

    obj['nots'] = [];
    var nots = parser.getNots(obj['raw']);
    for (var j in nots) {
      obj['nots'][j] = parse(nots[j])[0]; // every :not includes another selector
    }

    obj['attributes'] = parser.getAttributes(selector);

    arr[i] = new Selector(obj);
  }

  return arr;
};

/**
 * var stringify - convert selector's representation as an array into the raw selector as a string
 *
 * @param  {array} arr - array of Selectors
 * @returns {string}
 */
var stringify = function(arr) {
  var constructRawSelector = function(selector) {
    var str = '';

    str += parser.getTag(selector['raw']) || '';

    for (var i in selector['ids']) {
      str += '#' + selector['ids'][i];
    }

    for (var i in selector['classes']) {
      str += '.' + selector['classes'][i];
    }

    for (var i in selector['pseudoClasses']) {
      str += ':' + selector['pseudoClasses'][i];
    }

    for (var i in selector['pseudoElements']) {
      str += '::' + selector['pseudoElements'][i];
    }

    for (var i in selector['attributes']) {
      str += '[' + selector['attributes'][i]['raw'] + ']';
    }

    for (var i in selector['nots']) {
      str += ':not(' + constructRawSelector(selector['nots'][i]) + ')';
    }

    return str;
  };

  var stringifyRecursive = function(arr) {
    var str = '';

    for (var i in arr) {
      var selector = arr[i];

      str += constructRawSelector(selector);

      for (var operator in parser.HIERARCHY_OPERATORS) {
        var hir = parser.HIERARCHY_OPERATORS[operator];

        if (selector[hir]) {
          str += (' ' + operator + ' ').replace('   ', ' '); // in case operator is whitespace
          str += stringify([selector[hir]]);
        }
      }

      str += ', ';
    }

    return str;
  };

  var str = stringifyRecursive(arr);
  if (', ' === str.slice(str.length - 2, str.length)) {
    str = str.slice(0, str.length - 2); // cut last redundent comma
  }
  return str;
};

module.exports._Selector = Selector;
module.exports.parse = parse;
module.exports.stringify = stringify;
