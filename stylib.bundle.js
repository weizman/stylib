(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var stylib = require('./stylib');

(function(win, doc) {
  if ('object' !== typeof window['SL']) {
    window['SL'] = {};
    for (var prop in stylib) {
      if (!stylib.hasOwnProperty(prop)) {
        continue;
      }

      window['SL'][prop] = stylib[prop];
    }
  }
}(window, document));

},{"./stylib":5}],2:[function(require,module,exports){
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
var PSEUDOE_REGEX = /\:-?[_a-zA-Z]+[_a-zA-Z0-9-\(\+\)]*/g;

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
  return string.trim(selector.split('.')[0].split('#')[0].split(':')[0].split(' ')[0]) || '*';
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
 * var getPseudos - get selector string and extract the pseudos from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getPseudos = function(selector) {
  // following might include pseudo selector regex as well. get rid of before matching
  selector = selector.replace(NON_VAL_ATTRS_REGEX, '');
  selector = selector.replace(WITH_VAL_ATTRS_REGEX, '');
  selector = selector.replace(PSEUDOE_NOT_REGEX, '');

  var matches = getRegexMatches(selector, PSEUDOE_REGEX, function(match) {
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

    obj['tag'] = getTag(selector);

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
    obj['pseudos'] = getPseudos(selector);

    var nots = getNots(obj['raw']);
    if (nots) {
      obj['nots'] = [];
      for (var j in nots) {
        obj['nots'][j] = parse(nots[j])[0]; // every :not includes another selector
      }
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

Selector.parse = parse;
Selector.stringify = stringify;

module.exports = Selector;

},{"../utils/array":6,"../utils/string":7}],3:[function(require,module,exports){
var string = require('../utils/string');

/**
 * var parse - convert inline style string to valid inline style object
 *
 * @param  {string} str
 * @returns {object}
 */
var parse = function(str) {
  var obj = {};

  var sets = str.split(';');
  for (var i in sets) {
    var set = string.trim(sets[i]);
    if (!set) {
      continue;
    }

    var prop = string.trim(set.split(':')[0]);
    var val = string.trim(set.split(':')[1]);

    if (prop && val) {
      obj[prop] = val;
    }
  }

  return obj;
};

/**
 * var stringify - convert inline style object to valid inline style string
 *
 * @param  {object} obj
 * @returns {string}
 */
var stringify = function(obj) {
  var str = '';

  for (var prop in obj) {
    if (!obj.hasOwnProperty(prop)) {
      continue;
    }

    var val = obj[prop];

    str += prop + ': ' + val + '; ';
  }

  return str
};

module.exports.parse = parse;
module.exports.stringify = stringify;

},{"../utils/string":7}],4:[function(require,module,exports){
var string = require('../utils/string');

/**
 * var parse - convert outline style (css) string to valid outline style (css) object
 *
 * @param  {string} str
 * @returns {object}
 */
var parse = function(str) {
  var obj = {};

  var delimitor = Math.random().toString(36).slice(2);

  // trick to split by '{' and '}' but include them in splitted arr. TODO: REGEX IT
  var arr = str.split('{').join(delimitor + '{').split('}').join('}' + delimitor).split(delimitor);
  for (var i = 0; i < arr.length; i += 2) {
    if (i + 1 === arr.length) {
      continue;
    }

    var selector = string.trim(string.removeLineBreakers(arr[i]));
    if (!selector) {
      continue;
    }

    obj[selector] = {};

    var rules = string.removeLineBreakers(arr[i + 1]);
    rules = rules.slice(1, rules.length - 1); // get rid of '{' and '}'

    var sets = rules.split(';');
    for (var j in sets) {
      var set = sets[j];

      var prop = string.trim(set.split(':')[0]);
      if (!prop) {
          continue;
      }

      var val = string.trim(set.split(':')[1]);
      if (!val) {
        continue;
      }

      obj[selector][prop] = val;
    }
  }

  return obj;
};

/**
 * var stringify - convert outline style (css) object to valid outline style (css) string
 *
 * @param  {object} obj
 * @returns {string}
 */
var stringify = function(obj) {
  var str = '';
  for (var selector in obj) {
    if (!obj.hasOwnProperty(selector)) {
      continue;
    }

    var rules = obj[selector];

    str += selector + ' {\n';

    for (var prop in rules) {
      if (!rules.hasOwnProperty(prop)) {
        continue;
      }

      var val = rules[prop];

      str += '\t' + prop + ': ' + val + ';\n';
    }

    str += '}\n';
  }

  return str;
};

module.exports.parse = parse;
module.exports.stringify = stringify;

},{"../utils/string":7}],5:[function(require,module,exports){
var inline = require('./modules/inline');
var outline = require('./modules/outline');
var Selector = require('./modules/Selector');

module.exports.inline = inline;
module.exports.outline = outline;
module.exports.Selector = Selector;

},{"./modules/Selector":2,"./modules/inline":3,"./modules/outline":4}],6:[function(require,module,exports){
/**
 * var includes - return whether provided arr includes provided value in it or not
 *
 * @param  {array} arr
 * @param  {*} search
 * @param  {number} [start] index to start search from in arr
 * @returns {boolean}
 */
var includes = function(arr, search, start) {
  if ('number' !== typeof start) {
     start = 0;
   }

   return -1 !== arr.indexOf(search, start);
};

module.exports.includes = includes;

},{}],7:[function(require,module,exports){
/**
 * var trim - get string and return it trimmed (no whitespaces at the beginning/end)
 *
 * @param  {string} str
 * @returns {string}
 */
var trim = function(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

/**
 * var removeLineBreakers - get string and return it without any line breakers (\n\r)
 *
 * @param  {string} str
 * @returns {string}     
 */
var removeLineBreakers = function(str) {
  return str.replace(/(\r\n|\n|\r)/gm, '');
};

module.exports.trim = trim;
module.exports.removeLineBreakers = removeLineBreakers;

},{}]},{},[1]);
