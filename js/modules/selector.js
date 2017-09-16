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

function Selector(selectorStr) {
  this.selectorStr = selectorStr;
  this.selectorObj = parse(this.selectorStr);
};

Selector.prototype.append = {};
Selector.prototype.remove = {};

Selector.prototype.append.class = function(str) {

};

var getRegexMatches = function(str, regex, onMatch) {
  onMatch = onMatch || function(match) {
    return match;
  };
  var matches = [];

  var res = regex.exec(str);
  while (res) {
    matches.push(onMatch(res[0]));
    res = regex.exec(str);
  }

  return matches;
};

var handleNot = function(selector) {
  var matches = getRegexMatches(selector, new RegExp(/\:not\(.*\)/g), function(match) {
    return match.slice(5, match.length - 1)
  });

  if (!matches.length) {
    return null;
  }

  return matches;
};

var handleHierarchy = function(selector) {
  var parts = selector.split(/( )/);
  for (var i in parts) {
    var operator = parts.shift();

    if (' ' === operator && -1 < Object.keys(HIERARCHY_OPERATORS).indexOf(parts[i])) {
      continue;
    }

    if (-1 < Object.keys(HIERARCHY_OPERATORS).indexOf(operator)) {
      return [parts.join(' '), HIERARCHY_OPERATORS[operator]];
    }
  }

  return null;
};

var extractIds = function(obj) {
  var selector = obj['selector'];

  selector = selector.replace(/\[-?[_a-zA-Z]+[_a-zA-Z0-9-]*\]/g, '');
  selector = selector.replace(/\[-?[_a-zA-Z]+[_a-zA-Z0-9-]*[\^\*\$\~\|]*\=[\"\'].*[\"\']\]/g, '');
  selector = selector.replace(/\:not\(.*\)/g, '');

  var matches = getRegexMatches(selector, new RegExp(/\#-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g), function(match) {
    return match.substr(1, match.length);
  });

  obj['ids'] = matches;
};

var extractClasses = function(obj) {
  var selector = obj['selector'];

  selector = selector.replace(/\[-?[_a-zA-Z]+[_a-zA-Z0-9-]*\]/g, '');
  selector = selector.replace(/\[-?[_a-zA-Z]+[_a-zA-Z0-9-]*[\^\*\$\~\|]*\=[\"\'].*[\"\']\]/g, '');
  selector = selector.replace(/\:not\(.*\)/g, '');

  var matches = getRegexMatches(selector, new RegExp(/\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g), function(match) {
    return match.substr(1, match.length);
  });

  obj['classes'] = matches;
};

var extractPseudos = function(obj) {
  var selector = obj['selector'];

  selector = selector.replace(/\[-?[_a-zA-Z]+[_a-zA-Z0-9-]*\]/g, '');
  selector = selector.replace(/\[-?[_a-zA-Z]+[_a-zA-Z0-9-]*[\^\*\$\~\|]*\=[\"\'].*[\"\']\]/g, '');
  selector = selector.replace(/\:not\(.*\)/g, '');

  var matches = getRegexMatches(selector, new RegExp(/\:-?[_a-zA-Z]+[_a-zA-Z0-9-\(\+\)]*/g), function(match) {
    return match.substr(1, match.length);
  });

  obj['pseudos'] = matches;
};

var extractAttributes = function(obj) {
  var selector = obj['selector'];

  selector = selector.replace(/\:not\(.*\)/g, '');

  var attrsWithoutVal = getRegexMatches(selector.split('][').join(']\n['), new RegExp(/\[-?[_a-zA-Z]+[_a-zA-Z0-9-]*\]/g));
  var attrsWithVal = getRegexMatches(selector.split('][').join(']\n['), new RegExp(/\[-?[_a-zA-Z]+[_a-zA-Z0-9-]*[\^\*\$\~\|]*\=[\"\'].*[\"\']\]/g));
  var matches = attrsWithVal.concat(attrsWithoutVal);

  obj['attributes'] = [];

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
      operator = attr.slice(eqSignPos - 1, eqSignPos + 1);

      if (-1 === Object.keys(ATTRIBUTES_OPERATORS).indexOf(operator)) {
        operator = '=';
      }

      prop = attr.split(operator)[0];
      val = attr.substring(attr.indexOf(operator) + operator.length + 1, attr.length - 1);
      behav = ATTRIBUTES_OPERATORS[operator];
    }

    attrObj['prop'] = prop;
    attrObj['val'] = val;
    attrObj['behav'] = behav;
    attrObj['operator'] = operator;

    obj['attributes'][i] = attrObj;
  }
};

var extractTag = function(obj) {
  obj['tag'] = string.trim(obj['selector'].split('.')[0].split('#')[0].split(':')[0]);
};

var parse = function(str) { // P:hover > SPAN, DIV P, STYLE:empty.class1#id2[style="height: 100px;"]
  var arr = [];

  var selectors = str.split(',');
  for (var i in selectors) {
    var selector = selectors[i];

    var obj = {};

    selector = string.trim(selector);
    obj['selector'] = selector.split(' ')[0];

    extractTag(obj);
    extractIds(obj);
    extractClasses(obj);
    extractPseudos(obj);

    var nots = handleNot(obj['selector']);
    if (nots) {
      obj['nots'] = [];
      for (var j in nots) {
        var not = nots[j];

        obj['nots'][j] = parse(not)[0];
      }
    }

    extractAttributes(obj);

    var childSelectorAndKind = handleHierarchy(selector);
    if (childSelectorAndKind) {
      var childSelector = childSelectorAndKind[0];
      var kind = childSelectorAndKind[1];

      obj[kind] = parse(childSelector)[0];
    }

    arr[i] = obj;
  }

  return arr;
};

var stringify = function() {};

module.exports.parse = parse;
