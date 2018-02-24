var string = require('../../utils/string');

var ATTRIBUTES_OPERATORS = {
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
 * var getRegexMatches - get string and regular expressions and return matches
 *
 * @param  {string} str
 * @param  {array} rgxs array of type RegExp
 * @param  {function} [onmatch] to run on each match
 * @returns {array}
 */
var getRegexMatches = function(str, rgxs, onmatch) {
  onmatch = onmatch || function(match) {
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
var getRidOfMatches = function(str, rgxs) {
  for (var i in rgxs) {
    var rgx = rgxs[i];

    getRegexMatches(str, [rgx], function(match) {
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
var getRaw = function(selector) {
  // temp delimitor to help get rid of only specific whitespaces in string but not all of them
  var delimitor = Math.random().toString(36).slice(2);

  // following regexs matches might contain whitespaces that should be ignored when trying to extract raw selector
  getRegexMatches(selector, [NON_VAL_ATTRS_REGEX, WITH_VAL_ATTRS_REGEX, PSEUDOE_NOT_REGEX], function(match) {
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
var getTag = function(selector) {
  return string.trim(selector.split('.')[0].split('#')[0].split(':')[0].split(' ')[0].split('[')[0]) || null;
};

/**
 * var getIds - get selector string and extract the ids from it
 *
 * @param  {string} selector
 * @returns {array}
 */
var getIds = function(selector) {
  // following might include id selector regex as well. get rid of before matching
  selector = getRidOfMatches(selector, [NON_VAL_ATTRS_REGEX, WITH_VAL_ATTRS_REGEX, PSEUDOE_NOT_REGEX]);

  var matches = getRegexMatches(selector, [ID_REGEX], function(match) {
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
var getClasses = function(selector) {
  // following might include class selector regex as well. get rid of before matching
  selector = getRidOfMatches(selector, [NON_VAL_ATTRS_REGEX, WITH_VAL_ATTRS_REGEX, PSEUDOE_NOT_REGEX]);

  var matches = getRegexMatches(selector, [CLASS_REGEX], function(match) {
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
var getPseudoElements = function(selector) {
  // following might include pseudo class selector regex as well. get rid of before matching
  selector = getRidOfMatches(selector, [NON_VAL_ATTRS_REGEX, WITH_VAL_ATTRS_REGEX, PSEUDOE_NOT_REGEX]);

  var matches = getRegexMatches(selector, [PSEUDOE_ELEMENT_REGEX], function(match) {
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
var getPseudoClasses = function(selector) {
  // following might include pseudo class selector regex as well. get rid of before matching
  selector = getRidOfMatches(selector, [NON_VAL_ATTRS_REGEX, WITH_VAL_ATTRS_REGEX, PSEUDOE_NOT_REGEX, PSEUDOE_ELEMENT_REGEX]);

  var matches = getRegexMatches(selector, [PSEUDOE_CLASS_REGEX], function(match) {
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
var getNots = function(selector) {
  var matches = getRegexMatches(selector, [PSEUDOE_NOT_REGEX], function(match) {
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
var getAttributes = function(selector) {
  // following might include attributes selector regex as well. get rid of before matching
  selector = getRidOfMatches(selector, [PSEUDOE_NOT_REGEX]);

  // helps regex work correcly. TODO: REGEX SHOULD BE FIXED
  selector = selector.split('][').join(']\n[');

  var matches = getRegexMatches(selector, [WITH_VAL_ATTRS_REGEX]).concat(getRegexMatches(selector, [NON_VAL_ATTRS_REGEX]));

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
var splitByHierarchy = function(selector) {
  getRegexMatches(selector, [NON_VAL_ATTRS_REGEX, WITH_VAL_ATTRS_REGEX, PSEUDOE_NOT_REGEX], function(match) {
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
      var isAfrCharAnOperator = Object.keys(HIERARCHY_OPERATORS).includes(afrChar)

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
