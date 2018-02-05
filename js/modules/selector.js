var string = require('../utils/string');
var array = require('../utils/array');

var  ATTRIBUTES_OPERATORS = {
  '' : 'present',
  '=' : 'equals',
  '*=' : 'contains',
  '^=' : 'beginsWith',
  '$=' : 'endsWith',
  '~=' : 'spaced',
  '|=' : 'hyphenated'
};

var HIERARCHY_OPERATORS = {
  ' ' : 'descendant',
  '>' : 'directChild',
  '~' : 'generalSibling',
  '+' : 'adjacentSibling'
};

var PSEUDOE_NOT_REGEX = /:not[^\)]*/g;
var NON_VAL_ATTRS_REGEX = /\[-?[_a-zA-Z]+[_a-zA-Z0-9-]*\]/g;
var WITH_VAL_ATTRS_REGEX = /\[-?[_a-zA-Z]+[_a-zA-Z0-9-]*[\^\*\$\~\|]*\=[\"\'].*[\"\']\]/g;
var ID_REGEX = /\#-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g;
var CLASS_REGEX = /\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g;
var PSEUDOE_CLASS_REGEX = /\:-?[_a-zA-Z]+[_a-zA-Z0-9-\(\+\)]*/g;
var PSEUDOE_ELEMENT_REGEX = /\:\:-?[_a-zA-Z]+[_a-zA-Z0-9-\(\+\)]*/g;

/**
 * var getRegexMatches - get string and regular expression and return matches
 *
 * @param  {string} str
 * @param  {RegExp} rgx
 * @param  {function} [onmatch] to run on each match
 * @returns {array}
 */
var getRegexMatches = function(str, rgx, onmatch) {
  rgx = new RegExp(rgx);

  onmatch = onmatch || function(match) {
    return match;
  };

  var matches = [];

  var res = rgx.exec(str);
  while (res) {
    res = onmatch(res[0]);
    matches.push(res);
    res = rgx.exec(str);
  }

  return matches;
};

/**
 * var getTag - get selector string and extract the tag from it
 *
 * @param  {string} selector
 * @returns {string}
 */
var getTag = function(selector) {
  return string.trim(selector.split('.')[0].split('#')[0].split(':')[0].split(' ')[0]) || null;
};

/**
 * var getIds - get selector string and extract the ids from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getIds = function(selector) {
  // following might include id selector regex as well. get rid of before matching
  selector = selector.replace(NON_VAL_ATTRS_REGEX, '');
  selector = selector.replace(WITH_VAL_ATTRS_REGEX, '');
  selector = selector.replace(PSEUDOE_NOT_REGEX, '');

  var matches = getRegexMatches(selector, ID_REGEX, function(match) {
    return match.substr(1, match.length); // get rid of '#'
  });

  return matches;
};

/**
 * var getClasses - get selector string and extract the classes from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getClasses = function(selector) {
  // following might include class selector regex as well. get rid of before matching
  selector = selector.replace(NON_VAL_ATTRS_REGEX, '');
  selector = selector.replace(WITH_VAL_ATTRS_REGEX, '');
  selector = selector.replace(PSEUDOE_NOT_REGEX, '');

  var matches = getRegexMatches(selector, CLASS_REGEX, function(match) {
    return match.substr(1, match.length); // get rid of '.'
  });

  return matches;
};

/**
 * var getPseudoElements - get selector string and extract the pseudo elements from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getPseudoElements = function(selector) {
  // following might include pseudo class selector regex as well. get rid of before matching
  selector = selector.replace(NON_VAL_ATTRS_REGEX, '');
  selector = selector.replace(WITH_VAL_ATTRS_REGEX, '');
  selector = selector.replace(PSEUDOE_NOT_REGEX, '');

  var matches = getRegexMatches(selector, PSEUDOE_ELEMENT_REGEX, function(match) {
    return match.substr(2, match.length); // get rid of '::'
  });

  return matches;
};

/**
 * var getPseudoClasses - get selector string and extract the pseudo classes from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getPseudoClasses = function(selector) {
  // following might include pseudo class selector regex as well. get rid of before matching
  selector = selector.replace(NON_VAL_ATTRS_REGEX, '');
  selector = selector.replace(WITH_VAL_ATTRS_REGEX, '');
  selector = selector.replace(PSEUDOE_NOT_REGEX, '');
  selector = selector.replace(PSEUDOE_ELEMENT_REGEX, '');

  var matches = getRegexMatches(selector, PSEUDOE_CLASS_REGEX, function(match) {
    return match.substr(1, match.length); // get rid of ':'
  });

  return matches;
};

/**
 * var getNots - get selector string and extract the pseudos nots from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getNots = function(selector) {
  var matches = getRegexMatches(selector, PSEUDOE_NOT_REGEX, function(match) {
    return match.slice(5, match.length); // get rid of ':not('
  });

  if (!matches.length) {
    return null;
  }

  return matches;
};

/**
 * var getAttributes - get selector string and extract the attributes from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getAttributes = function(selector) {
  // following might include attributes selector regex as well. get rid of before matching
  selector = selector.replace(PSEUDOE_NOT_REGEX, '');

  // helps regex work correcly. TODO: REGEX SHOULD BE FIXED
  selector = selector.split('][').join(']\n[');

  var matches = getRegexMatches(selector, WITH_VAL_ATTRS_REGEX).concat(getRegexMatches(selector, NON_VAL_ATTRS_REGEX));

  var arr = []; // will include all attributes

  for (var i in matches) {
    var prop, val, behav, operator = '';
    var attr = matches[i].slice(1, matches[i].length - 1); // get rid of '[' and ']'
    var attrObj = {};

    attrObj['raw'] = attr;

    var eqSignPos = attr.indexOf('=');

    if (-1 === eqSignPos) {
      prop = attr;
      val = null;
      behav = ATTRIBUTES_OPERATORS[operator];

    } else {
      operator = attr.slice(eqSignPos - 1, eqSignPos + 1); // in case operator is like '{X}='

      if (!array.includes(Object.keys(ATTRIBUTES_OPERATORS), operator)) {
        operator = '=';
      }

      prop = attr.split(operator)[0];
      val = attr.substring(attr.indexOf(operator) + operator.length + 1, attr.length - 1);
      behav = ATTRIBUTES_OPERATORS[operator];
    }

    attrObj['property'] = prop;
    attrObj['value'] = val;
    attrObj['behaviour'] = behav;
    attrObj['operator'] = operator;

    arr[i] = attrObj;
  }

  return arr;
};

/**
 * var splitByHierarchy - get selector string, parse the next hierarchy in it, and return it
 *
 * @param  {string} selector
 * @returns {array} [selector before hierarchy operator occurence, kind of hierarchy, selector after hierarchy operator occurence]
 */
var splitByHierarchy = function(selector) {
  var parts = selector.split(/( )/); // split by whitespaces but include them in splitted arr

  for (var i = 0; i < parts.length; i++) {
    var bfrChar = parts[i - 1];
    var curChar = parts[i]; // possibly an operator
    var afrChar = parts[i + 1];

    if (array.includes(Object.keys(HIERARCHY_OPERATORS), curChar)) {
      var operator = curChar; // curChar is an operator

      // in case operator is not a whitespace, it must be between whitespaces inside array
      // this helps distinguish between regular whitespace and hierarchy operator whitespace
      if (' ' === bfrChar && ' ' === afrChar) {
        return [parts.slice(0, i + 1).join(''), HIERARCHY_OPERATORS[operator], parts.slice(i + 2).join('')];
      }

      var isBfrCharAnOperator = array.includes(Object.keys(HIERARCHY_OPERATORS), bfrChar);
      var isAfrCharAnOperator = array.includes(Object.keys(HIERARCHY_OPERATORS), afrChar);

      // in case operator is simply a whitespace and not the real operator, continue
      if (' ' === operator && (isBfrCharAnOperator || isAfrCharAnOperator)) {
        continue;
      }

      return [parts.slice(0, i - 1).join(''), HIERARCHY_OPERATORS[operator], parts.slice(i).join('')];
    }
  }

  return null;
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

    obj['tag'] = getTag(selector) || '*';

    var ret = splitByHierarchy(selector);
    if (ret) {
      var bfrSelector = ret[0];
      var hierarchyKind = ret[1];
      var afrSelector = ret[2];

      obj[hierarchyKind] = parse(afrSelector)[0]; // parse the next hierarchy component

      // only the selector of before the operator occurence should be extracted for information
      selector = bfrSelector;
    }

    obj['ids'] = getIds(selector);
    obj['classes'] = getClasses(selector);
    obj['pseudoElements'] = getPseudoElements(selector);
    obj['pseudoClasses'] = getPseudoClasses(selector);

    obj['nots'] = [];
    var nots = getNots(obj['raw']);
    for (var j in nots) {
      obj['nots'][j] = parse(nots[j])[0]; // every :not includes another selector
    }

    obj['attributes'] = getAttributes(selector);

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
  var stringifyRecursive = function(arr) {
    var str = '';

    for (var i in arr) {
      var selector = arr[i];

      str += selector['raw'];

      for (var operator in HIERARCHY_OPERATORS) {
        var hir = HIERARCHY_OPERATORS[operator];

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

module.exports._Selector = Selector;
module.exports.parse = parse;
module.exports.stringify = stringify;
