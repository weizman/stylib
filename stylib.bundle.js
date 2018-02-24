(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var stylib = require('./stylib');

(function (win, doc) {
  if ('object' !== _typeof(window['SL'])) {
    window['SL'] = {};
    for (var prop in stylib) {
      if (!stylib.hasOwnProperty(prop)) {
        continue;
      }

      window['SL'][prop] = stylib[prop];
    }
  }
})(window, document);

},{"./stylib":6}],2:[function(require,module,exports){
'use strict';

var string = require('../../utils/string');

/**
 * var parse - convert inline style string to valid inline style object
 *
 * @param  {string} str
 * @returns {object}
 */
var parse = function parse(str) {
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
var stringify = function stringify(obj) {
  var str = '';

  for (var prop in obj) {
    if (!obj.hasOwnProperty(prop)) {
      continue;
    }

    var val = obj[prop];

    str += prop + ': ' + val + '; ';
  }

  return str;
};

module.exports.parse = parse;
module.exports.stringify = stringify;

},{"../../utils/string":7}],3:[function(require,module,exports){
'use strict';

var string = require('../../utils/string');

/**
 * var parse - convert outline style (css) string to valid outline style (css) object
 *
 * @param  {string} str
 * @returns {object}
 */
var parse = function parse(str) {
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

    if (!obj[selector]) {
      obj[selector] = {};
    }

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
var stringify = function stringify(obj) {
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

},{"../../utils/string":7}],4:[function(require,module,exports){
'use strict';

var string = require('../../utils/string');

var ATTRIBUTES_OPERATORS = {
  '': 'present',
  '=': 'equals',
  '*=': 'contains',
  '^=': 'beginsWith',
  '$=': 'endsWith',
  '~=': 'spaced',
  '|=': 'hyphenated'
};

var HIERARCHY_OPERATORS = {
  ' ': 'descendant',
  '>': 'directChild',
  '~': 'generalSibling',
  '+': 'adjacentSibling'
};

var PSEUDOE_NOT_REGEX = /:not[^\)]*/g;
var NON_VAL_ATTRS_REGEX = /\[-?[_a-zA-Z]+[_a-zA-Z0-9-]*\]/g;
var WITH_VAL_ATTRS_REGEX = /\[-?[_a-zA-Z]+[_a-zA-Z0-9-]*[\^\*\$\~\|]*\=[\"\'].*[\"\']\]/g;
var ID_REGEX = /\#-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g;
var CLASS_REGEX = /\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g;
var PSEUDOE_CLASS_REGEX = /\:-?[_a-zA-Z]+[_a-zA-Z0-9-\(\+\)]*/g;
var PSEUDOE_ELEMENT_REGEX = /\:\:-?[_a-zA-Z]+[_a-zA-Z0-9-\(\+\)]*/g;

/**
 * var getRegexMatches - get string and regular expressions and return matches
 *
 * @param  {string} str
 * @param  {array} rgxs array of type RegExp
 * @param  {function} [onmatch] to run on each match
 * @returns {array}
 */
var getRegexMatches = function getRegexMatches(str, rgxs, onmatch) {
  onmatch = onmatch || function (match) {
    return match;
  };

  var matches = [];

  for (var i in rgxs) {
    var rgx = new RegExp(rgxs[i]);
    var res = rgx.exec(str);

    while (res) {
      res = onmatch(res[0]);
      matches.push(res);
      res = rgx.exec(str);
    }
  }

  return matches;
};

/**
 * getRidOfMatches - get regexs and remove matches occurences from provided string
 *
 * @param  {string} str  to find in matches
 * @param  {array} rgxs to match in provided string
 * @returns {str}      after manipulations
 */
var getRidOfMatches = function getRidOfMatches(str, rgxs) {
  for (var i in rgxs) {
    var rgx = rgxs[i];

    getRegexMatches(str, [rgx], function (match) {
      if (PSEUDOE_NOT_REGEX === rgx) {
        match += ')'; // fix logic issue in the not regex
      }

      str = str.replace(match, '');
    });
  }

  return str;
};

/**
 * var getRaw - get selector string and extract the raw selector from it
 *
 * @param  {string} selector
 * @returns {string}
 */
var getRaw = function getRaw(selector) {
  // temp delimitor to help get rid of only specific whitespaces in string but not all of them
  var delimitor = Math.random().toString(36).slice(2);

  // following regexs matches might contain whitespaces that should be ignored when trying to extract raw selector
  getRegexMatches(selector, [NON_VAL_ATTRS_REGEX, WITH_VAL_ATTRS_REGEX, PSEUDOE_NOT_REGEX], function (match) {
    selector = selector.replace(match, match.split(' ').join(delimitor));
  });

  // sub selector hierarchy components are separated by ' '
  return selector.split(' ')[0].split(delimitor).join(' ');
};

/**
 * var getTag - get selector string and extract the tag from it
 *
 * @param  {string} selector
 * @returns {string}
 */
var getTag = function getTag(selector) {
  return string.trim(selector.split('.')[0].split('#')[0].split(':')[0].split(' ')[0].split('[')[0]) || null;
};

/**
 * var getIds - get selector string and extract the ids from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getIds = function getIds(selector) {
  // following might include id selector regex as well. get rid of before matching
  selector = getRidOfMatches(selector, [NON_VAL_ATTRS_REGEX, WITH_VAL_ATTRS_REGEX, PSEUDOE_NOT_REGEX]);

  var matches = getRegexMatches(selector, [ID_REGEX], function (match) {
    return match.replace('#', '');
  });

  return matches;
};

/**
 * var getClasses - get selector string and extract the classes from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getClasses = function getClasses(selector) {
  // following might include class selector regex as well. get rid of before matching
  selector = getRidOfMatches(selector, [NON_VAL_ATTRS_REGEX, WITH_VAL_ATTRS_REGEX, PSEUDOE_NOT_REGEX]);

  var matches = getRegexMatches(selector, [CLASS_REGEX], function (match) {
    return match.replace('.', '');
  });

  return matches;
};

/**
 * var getPseudoElements - get selector string and extract the pseudo elements from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getPseudoElements = function getPseudoElements(selector) {
  // following might include pseudo class selector regex as well. get rid of before matching
  selector = getRidOfMatches(selector, [NON_VAL_ATTRS_REGEX, WITH_VAL_ATTRS_REGEX, PSEUDOE_NOT_REGEX]);

  var matches = getRegexMatches(selector, [PSEUDOE_ELEMENT_REGEX], function (match) {
    return match.replace('::', '');
  });

  return matches;
};

/**
 * var getPseudoClasses - get selector string and extract the pseudo classes from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getPseudoClasses = function getPseudoClasses(selector) {
  // following might include pseudo class selector regex as well. get rid of before matching
  selector = getRidOfMatches(selector, [NON_VAL_ATTRS_REGEX, WITH_VAL_ATTRS_REGEX, PSEUDOE_NOT_REGEX, PSEUDOE_ELEMENT_REGEX]);

  var matches = getRegexMatches(selector, [PSEUDOE_CLASS_REGEX], function (match) {
    return match.replace(':', '');
  });

  return matches;
};

/**
 * var getNots - get selector string and extract the pseudos nots from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getNots = function getNots(selector) {
  var matches = getRegexMatches(selector, [PSEUDOE_NOT_REGEX], function (match) {
    return match.replace(':not(', '');
  });

  return matches;
};

/**
 * var getAttributes - get selector string and extract the attributes from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getAttributes = function getAttributes(selector) {
  // following might include attributes selector regex as well. get rid of before matching
  selector = getRidOfMatches(selector, [PSEUDOE_NOT_REGEX]);

  // helps regex work correcly. TODO: REGEX SHOULD BE FIXED
  selector = selector.split('][').join(']\n[');

  var matches = getRegexMatches(selector, [WITH_VAL_ATTRS_REGEX]).concat(getRegexMatches(selector, [NON_VAL_ATTRS_REGEX]));

  var arr = []; // will include all attributes

  for (var i in matches) {
    var prop,
        val,
        behav,
        operator = '';
    var attr = matches[i].slice(1, matches[i].length - 1); // get rid of '[' and ']'
    var attrObj = {};

    attrObj['raw'] = attr;

    var eqSignPos = attr.indexOf('=');

    if (-1 === eqSignPos) {
      prop = attr;
      val = null;
      behav = ATTRIBUTES_OPERATORS[operator];
    } else {
      operator = attr.slice(eqSignPos - 1, eqSignPos + 1); // in case operator is like *= or ^= etc..

      if (!Object.keys(ATTRIBUTES_OPERATORS).includes(operator)) {
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
var splitByHierarchy = function splitByHierarchy(selector) {
  getRegexMatches(selector, [NON_VAL_ATTRS_REGEX, WITH_VAL_ATTRS_REGEX, PSEUDOE_NOT_REGEX], function (match) {
    selector = selector.split(match).join(match.split(' ').join(''));
  });

  var parts = selector.split(/( )/); // split by whitespaces but include them in splitted arr

  for (var i = 0; i < parts.length; i++) {
    var bfrChar = parts[i - 1];
    var curChar = parts[i]; // possibly an operator
    var afrChar = parts[i + 1];

    if (Object.keys(HIERARCHY_OPERATORS).includes(curChar)) {
      var operator = curChar; // curChar is an operator

      // in case operator is not a whitespace, it must be between whitespaces inside array
      // this helps distinguish between regular whitespace and hierarchy operator whitespace
      if (' ' === bfrChar && ' ' === afrChar) {
        return [parts.slice(0, i + 1).join(''), HIERARCHY_OPERATORS[operator], parts.slice(i + 2).join('')];
      }

      var isBfrCharAnOperator = Object.keys(HIERARCHY_OPERATORS).includes(bfrChar);
      var isAfrCharAnOperator = Object.keys(HIERARCHY_OPERATORS).includes(afrChar);

      // in case operator is simply a whitespace and not the real operator, continue
      if (' ' === operator && (isBfrCharAnOperator || isAfrCharAnOperator)) {
        continue;
      }

      return [parts.slice(0, i - 1).join(''), HIERARCHY_OPERATORS[operator], parts.slice(i).join('')];
    }
  }

  return null;
};

module.exports.HIERARCHY_OPERATORS = HIERARCHY_OPERATORS;
module.exports.ATTRIBUTES_OPERATORS = ATTRIBUTES_OPERATORS;
module.exports.getRaw = getRaw;
module.exports.getTag = getTag;
module.exports.getIds = getIds;
module.exports.getClasses = getClasses;
module.exports.getPseudoElements = getPseudoElements;
module.exports.getPseudoClasses = getPseudoClasses;
module.exports.getNots = getNots;
module.exports.getAttributes = getAttributes;
module.exports.splitByHierarchy = splitByHierarchy;

},{"../../utils/string":7}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var string = require('../../utils/string');
var parser = require('./parser.js');

/**
 * var updateSelectorParent - get a Selector that just got modified
 *  and make sure to modify it's parents Selectors as well accordingly
 *
 * @param  {Selector} selector
 */
var updateSelectorParent = function updateSelectorParent(selector) {
  while (selector['parent']) {
    selector['parent']['raw'] = selector['parent'].stringify();
    selector = selector['parent'];
  }
};

/**
 * var addToSelector - add provided selector type to Selector
 *
 * @param  {Selector} selector
 * @param  {string} type
 * @param  {string/object} val
 */
var addToSelector = function addToSelector(selector, type, val) {
  if (selector[type].includes(val)) {
    return;
  }

  selector[type].push(val);

  selector['raw'] = selector.stringify();

  updateSelectorParent(selector);
};

/**
 * var removeFromSelector - remove provided selector type from Selector
 *
 * @param  {Selector} selector
 * @param  {string} type
 * @param  {string/object} val
 */
var removeFromSelector = function removeFromSelector(selector, type, val) {
  selector[type] = selector[type].filter(function (curVal) {
    return curVal !== val && (!curVal.raw || !val.raw || curVal.raw !== val.raw);
  });

  selector['raw'] = selector.stringify();

  updateSelectorParent(selector);
};

/**
 * var isContainedInSelector - tell whether provided selector type is contained in selector
 *
 * @param  {Selector} selector
 * @param  {string} type
 * @param  {string/object} val
 * @returns {bool}
 */
var isContainedInSelector = function isContainedInSelector(selector, type, val) {
  return selector[type].filter(function (curVal) {
    return curVal === val || curVal.raw && val.raw && curVal.raw === val.raw;
  }).length !== 0;
};

/**
 * class Selector
 *
 * @param {object} selectorObj contains object representation of parsed selector
 */

var Selector = function () {
  function Selector(selectorObj) {
    _classCallCheck(this, Selector);

    for (var prop in selectorObj) {
      this[prop] = selectorObj[prop];
    }
  }

  _createClass(Selector, [{
    key: 'stringify',
    value: function stringify() {
      return _stringify([this]);
    }
  }, {
    key: 'parse',
    value: function parse() {
      return _parse(this.raw);
    }
  }, {
    key: 'updateTag',
    value: function updateTag(val) {
      this['tag'] = val || '*';

      var prevTag = parser.getTag(this['raw']);
      if (!prevTag) {
        this['raw'] = val + this['raw'];
      } else {
        this['raw'] = this['raw'].replace(prevTag, val);
      }

      updateSelectorParent(this);
    }
  }, {
    key: 'equalsTag',
    value: function equalsTag(val) {
      return this['tag'] === val;
    }
  }, {
    key: 'addId',
    value: function addId(val) {
      addToSelector(this, 'ids', val);
    }
  }, {
    key: 'removeId',
    value: function removeId(val) {
      removeFromSelector(this, 'ids', val);
    }
  }, {
    key: 'containsId',
    value: function containsId(val) {
      return isContainedInSelector(this, 'ids', val);
    }
  }, {
    key: 'addClass',
    value: function addClass(val) {
      addToSelector(this, 'classes', val);
    }
  }, {
    key: 'removeClass',
    value: function removeClass(val) {
      removeFromSelector(this, 'classes', val);
    }
  }, {
    key: 'containsClass',
    value: function containsClass(val) {
      return isContainedInSelector(this, 'classes', val);
    }
  }, {
    key: 'addPseudoClass',
    value: function addPseudoClass(val) {
      addToSelector(this, 'pseudoClasses', val);
    }
  }, {
    key: 'removePseudoClass',
    value: function removePseudoClass(val) {
      removeFromSelector(this, 'pseudoClasses', val);
    }
  }, {
    key: 'containsPseudoClass',
    value: function containsPseudoClass(val) {
      return isContainedInSelector(this, 'pseudoClasses', val);
    }
  }, {
    key: 'addPseudoElement',
    value: function addPseudoElement(val) {
      addToSelector(this, 'pseudoElements', val);
    }
  }, {
    key: 'removePseudoElement',
    value: function removePseudoElement(val) {
      removeFromSelector(this, 'pseudoElements', val);
    }
  }, {
    key: 'containsPseudoElement',
    value: function containsPseudoElement(val) {
      return isContainedInSelector(this, 'pseudoElements', val);
    }
  }, {
    key: 'addAttribute',
    value: function addAttribute(prop, operator, val) {
      var raw = prop; // TODO: make it possible to pass 'contains' instead of '*='

      if ('' !== operator) {
        raw += operator + val;
      }

      for (var i in this['attributes']) {
        if (raw === this['attributes'][i].raw) {
          return;
        }
      }

      addToSelector(this, 'attributes', {
        'property': prop,
        'value': val,
        'behaviour': parser.ATTRIBUTES_OPERATORS[operator],
        'operator': operator,
        'raw': raw
      });
    }
  }, {
    key: 'removeAttribute',
    value: function removeAttribute(prop, operator, val) {
      var raw = prop; // TODO: make it possible to pass 'contains' instead of '*='

      if ('' !== operator) {
        raw += operator + val;
      }

      removeFromSelector(this, 'attributes', {
        'property': prop,
        'value': val,
        'behaviour': parser.ATTRIBUTES_OPERATORS[operator],
        'operator': operator,
        'raw': raw
      });
    }
  }, {
    key: 'containsAttribute',
    value: function containsAttribute(prop, operator, val) {
      var raw = prop; // TODO: make it possible to pass 'contains' instead of '*='

      if ('' !== operator) {
        raw += operator + val;
      }

      return isContainedInSelector(this, 'attributes', {
        'property': prop,
        'value': val,
        'behaviour': parser.ATTRIBUTES_OPERATORS[operator],
        'operator': operator,
        'raw': raw
      });
    }
  }, {
    key: 'addNot',
    value: function addNot(val) {
      val['parent'] = this; // link new not to it's parent
      addToSelector(this, 'nots', val);
    }
  }, {
    key: 'removeNot',
    value: function removeNot(val) {
      delete val['parent'];
      removeFromSelector(this, 'nots', val);
    }
  }, {
    key: 'containsNot',
    value: function containsNot(val) {
      return isContainedInSelector(this, 'nots', val);
    }
  }]);

  return Selector;
}();

/**
 * var parse - convert selector string into the selector's representation as an array
 *
 * @param  {string} str
 * @returns {array} array of Selectors
 */


var _parse = function _parse(str) {
  var arr = []; // will include all selector's components

  var selectors = str.split(','); // ',' sepperates between different general sub selectors
  for (var i in selectors) {
    var selector = selectors[i];

    if (!selector) {
      continue;
    }

    var obj = {};

    selector = string.trim(selector);
    obj['raw'] = parser.getRaw(selector);
    obj['tag'] = parser.getTag(selector) || '*';

    var ret = parser.splitByHierarchy(selector);
    if (ret) {
      var bfrSelector = ret[0];
      var hierarchyKind = ret[1];
      var afrSelector = ret[2];

      obj[hierarchyKind] = _parse(afrSelector)[0]; // parse the next hierarchy component

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
      obj['nots'][j] = _parse(nots[j])[0]; // every :not includes another selector
    }

    obj['attributes'] = parser.getAttributes(selector);

    var selInst = new Selector(obj);

    // make sure every selector is linked to it's parent selector (if one exists)
    for (var j in selInst['nots']) {
      selInst['nots'][j]['parent'] = selInst;
    }

    for (var j in parser.HIERARCHY_OPERATORS) {
      if (selInst[parser.HIERARCHY_OPERATORS[j]]) {
        selInst[parser.HIERARCHY_OPERATORS[j]]['parent'] = selInst;
      }
    }

    arr[i] = selInst;
  }

  return arr;
};

/**
 * var stringify - convert selector's representation as an array into the raw selector as a string
 *
 * @param  {array} arr - array of Selectors
 * @returns {string}
 */
var _stringify = function _stringify(arr) {
  var constructRawSelector = function constructRawSelector(selector) {
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
      if (!selector['nots'][i]['parent']) {
        // in case a not was removed using API but this selector does not know it yet
        delete selector['nots'][i];
        continue;
      }

      str += ':not(' + constructRawSelector(selector['nots'][i]) + ')';
    }

    return str;
  };

  var stringifyRecursive = function stringifyRecursive(arr) {
    var str = '';

    for (var i in arr) {
      var selector = arr[i];

      str += constructRawSelector(selector);

      for (var operator in parser.HIERARCHY_OPERATORS) {
        var hir = parser.HIERARCHY_OPERATORS[operator];

        if (selector[hir]) {
          str += (' ' + operator + ' ').replace('   ', ' '); // in case operator is whitespace
          str += _stringify([selector[hir]]);
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

module.exports.parse = _parse;
module.exports.stringify = _stringify;

},{"../../utils/string":7,"./parser.js":4}],6:[function(require,module,exports){
'use strict';

var inline = require('./modules/inline/inline.js');
var outline = require('./modules/outline/outline.js');
var selector = require('./modules/selector/selector.js');

module.exports.inline = inline;
module.exports.outline = outline;
module.exports.selector = selector;

},{"./modules/inline/inline.js":2,"./modules/outline/outline.js":3,"./modules/selector/selector.js":5}],7:[function(require,module,exports){
'use strict';

/**
 * var trim - get string and return it trimmed (no whitespaces at the beginning/end)
 *
 * @param  {string} str
 * @returns {string}
 */
var trim = function trim(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

/**
 * var removeLineBreakers - get string and return it without any line breakers (\n\r)
 *
 * @param  {string} str
 * @returns {string}     
 */
var removeLineBreakers = function removeLineBreakers(str) {
  return str.replace(/(\r\n|\n|\r)/gm, '');
};

module.exports.trim = trim;
module.exports.removeLineBreakers = removeLineBreakers;

},{}]},{},[1]);
