var string = require('../../utils/string');
var parser = require('./parser');

/**
 * var updateSelectorParent - get a Selector that just got modified
 *  and make sure to modify it's parents Selectors as well accordingly
 *
 * @param  {Selector} selector
 */
var updateSelectorParent = function(selector) {
  while (selector['_parent']) {
    selector['_parent']['_raw'] = selector['_parent'].stringify();
    selector = selector['_parent'];
  }
};

/**
 * var addToSelector - add provided selector type to Selector
 *
 * @param  {Selector} selector
 * @param  {string} type
 * @param  {string/object} val
 */
var addToSelector = function(selector, type, val) {
  if (selector[type].includes(val)) {
    return;
  }

  selector[type].push(val);

  selector['_raw'] = selector.stringify();

  updateSelectorParent(selector);
};

/**
 * var removeFromSelector - remove provided selector type from Selector
 *
 * @param  {Selector} selector
 * @param  {string} type
 * @param  {string/object} val
 */
var removeFromSelector = function(selector, type, val) {
  selector[type] = selector[type].filter(function(curVal) {
    return curVal !== val && (!curVal['_raw'] || !val['_raw'] || curVal['_raw'] !== val['_raw']);
  });

  selector['_raw'] = selector.stringify();

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
var isContainedInSelector = function(selector, type, val) {
  return selector[type].filter(function(curVal) {
    return curVal === val || (curVal['_raw'] && val['_raw'] && curVal['_raw'] === val['_raw']);
  }).length !== 0;
};

/**
 * class Selector
 *
 * @param {object} selectorObj contains object representation of parsed selector
 */
class Selector {
  constructor(selectorObj) {
    for (var prop in selectorObj) {
      this[prop] = selectorObj[prop];
    }
  }

  stringify() {
    return stringify([this]);
  }

  parse() {
    return parse(this['_raw']);
  }

  isTag(tag) {
    return tag === this['tag'];
  }

  contains(prop, val) {
    if (!prop || !val) {
      return;
    }

    switch (prop) {

    case 'id':
      return isContainedInSelector(this, 'ids', val);
      break;

    case 'class':
      return isContainedInSelector(this, 'classes', val);
      break;

    case 'pseudoClass':
      return isContainedInSelector(this, 'pseudoClasses', val);
      break;

    case 'pseudoElement':
      return isContainedInSelector(this, 'pseudoElements', val);
      break;

    case 'attribute':
      // in case of attribute setting, variables and their order change
      var operator = arguments[2];
      prop = val;
      val = arguments[3];

      var raw = prop; // TODO: make it possible to pass 'contains' instead of '*='

      if ('' !== operator) {
        raw += operator + val;
      }

      return isContainedInSelector(this, 'attributes', {
        'property' : prop,
        'value' : val,
        'behaviour' : parser.ATTRIBUTES_OPERATORS[operator],
        'operator' : operator,
        '_raw' : raw
      });

      break;

    case 'not':
      return isContainedInSelector(this, 'nots', val);
    }
  }

  set(prop, val) {
    if (!prop || !val) {
      return;
    }

    switch (prop) {

    case 'tag':
      this['tag'] = val || '*';

      var prevTag = parser.getTag(this['_raw']);
      if (!prevTag) {
        this['_raw'] = val + this['_raw'];
      } else {
        this['_raw'] = this['_raw'].replace(prevTag, val);
      }

      updateSelectorParent(this);
      break;

    case 'id':
      addToSelector(this, 'ids', val);
      break;

    case 'class':
      addToSelector(this, 'classes', val);
      break;

    case 'pseudoClass':
      addToSelector(this, 'pseudoClasses', val);
      break;

    case 'pseudoElement':
      addToSelector(this, 'pseudoElements', val);
      break;

    case 'attribute':
      // in case of attribute setting, variables and their order change
      var operator = arguments[2];
      prop = val;
      val = arguments[3];

      var raw = prop; // TODO: make it possible to pass 'contains' instead of '*='

      if ('' !== operator) {
        raw += operator + val;
      }

      for (var i in this['attributes']) {
        if (raw === this['attributes'][i]['_raw']) {
          return;
        }
      }

      addToSelector(this, 'attributes', {
        'property' : prop,
        'value' : val,
        'behaviour' : parser.ATTRIBUTES_OPERATORS[operator],
        'operator' : operator,
        '_raw' : raw
      });

      break;

    case 'not':
      val['_parent'] = this; // link new not to it's parent
      addToSelector(this, 'nots', val);
    }
  }

  remove(prop, val) {
    if (!prop || !val) {
      return;
    }

    switch (prop) {

    case 'tag':
      this['set']('tag', '*');
      break;

    case 'id':
      removeFromSelector(this, 'ids', val);
      break;

    case 'class':
      removeFromSelector(this, 'classes', val);
      break;

    case 'pseudoClass':
      removeFromSelector(this, 'pseudoClasses', val);
      break;

    case 'pseudoElement':
      removeFromSelector(this, 'pseudoElements', val);
      break;

    case 'attribute':
      // in case of attribute setting, variables and their order change
      var operator = arguments[2];
      prop = val;
      val = arguments[3];

      var raw = prop; // TODO: make it possible to pass 'contains' instead of '*='

      if ('' !== operator) {
        raw += operator + val;
      }

      removeFromSelector(this, 'attributes', {
        'property' : prop,
        'value' : val,
        'behaviour' : parser.ATTRIBUTES_OPERATORS[operator],
        'operator' : operator,
        '_raw' : raw
      });

      break;

    case 'not':
      delete val['_parent'];
      removeFromSelector(this, 'nots', val);
    }
  }
}

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
    obj['_raw'] = parser.getRaw(selector);
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
    var nots = parser.getNots(obj['_raw']);
    for (var j in nots) {
      obj['nots'][j] = parse(nots[j])[0]; // every :not includes another selector
    }

    obj['attributes'] = parser.getAttributes(selector);

    var selInst = new Selector(obj);

    // make sure every selector is linked to it's parent selector (if one exists)
    for (var j in selInst['nots']) {
      selInst['nots'][j]['_parent'] = selInst;
    }

    for (var j in parser.HIERARCHY_OPERATORS) {
      if (selInst[parser.HIERARCHY_OPERATORS[j]]) {
        selInst[parser.HIERARCHY_OPERATORS[j]]['_parent'] = selInst;
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
var stringify = function(arr) {
  var constructRawSelector = function(selector) {
    var str = '';

    str += parser.getTag(selector['_raw']) || '';

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
      str += '[' + selector['attributes'][i]['_raw'] + ']';
    }

    for (var i in selector['nots']) {
      if (!selector['nots'][i]['_parent']) {
        // in case a not was removed using API but this selector does not know it yet
        delete selector['nots'][i];
        continue;
      }

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

module.exports.parse = parse;
module.exports.stringify = stringify;
