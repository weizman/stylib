var string = require('../utils/string');

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
    var attr = matches[i];
    var attrObj = {};

    attrObj['raw'] = attr;

    attr = attr.slice(1, attr.length - 1); // get rid of '[' and ']'

    var eqSignPos = attr.indexOf('=');

    if (-1 === eqSignPos) {
      prop = attr;
      val = null;
      behav = ATTRIBUTES_OPERATORS[operator];

    } else {
      operator = attr.slice(eqSignPos - 1, eqSignPos + 1); // in case operator is like '{X}='

      if (-1 === Object.keys(ATTRIBUTES_OPERATORS).indexOf(operator)) {
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
 * var getHierarchy - get selector string, parse the next hierarchy in it, and return it
 *
 * @param  {string} selector
 * @returns {array} [kind of hierarchy, new selector (contains only the child/sibling selector)]
 */
var getHierarchy = function(selector) {
  var parts = selector.split(/( )/); // split by whitespaces but include them in splitted arr

  for (var i = 0; i < parts.length; i++) {
    var operator = parts[i];

    // operator must be between whitespaces inside array
    // this helps distinguish between regular whitespace and hierarchy operator whitespace
    if (!(' ' === parts[i - 1] && ' ' === parts[i + 1])) {
      continue;
    }

    if (-1 < Object.keys(HIERARCHY_OPERATORS).indexOf(operator)) {
      parts = parts.slice(i + 2); // include only child/sibling from the selector
      return [HIERARCHY_OPERATORS[operator], parts.join('')];
    }
  }

  return null;
};

/**
 * var parse - convert selector string into the selector's representation as an object
 *
 * @param  {string} str
 * @returns {object}
 */
var parse = function(str) {
  var arr = []; // will include all selector's components

  var selectors = str.split(','); // ',' sepperates between different general sub selectors
  for (var i in selectors) {
    var selector = selectors[i];

    var obj = {};

    selector = string.trim(selector);
    obj['selector'] = selector.split(' ')[0]; // sub selector hierarchy components are separated by ' '

    obj['tag'] = getTag(selector);
    obj['ids'] = getIds(selector);
    obj['classes'] = getClasses(selector);
    obj['pseudos'] = getPseudos(selector);

    var nots = getNots(obj['selector']);
    if (nots) {
      obj['nots'] = [];
      for (var j in nots) {
        obj['nots'][j] = parse(nots[j])[0]; // every :not includes another selector
      }
    }

    obj['attributes'] = getAttributes(selector);

    var ret = getHierarchy(selector);
    if (ret) {
      var hierarchyKind = ret[0];
      var nextSelector = ret[1];

      obj[hierarchyKind] = parse(nextSelector)[0]; // parse the next hierarchy component
    }

    arr[i] = obj;
  }

  return arr;
};

module.exports.parse = parse;
