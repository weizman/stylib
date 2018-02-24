var string = require('../../utils/string');
var parser = require('./parser');

/**
 * var updateSelectorParent - get a Selector that just got modified
 *  and make sure to modify it's parents Selectors as well accordingly
 *
 * @param  {Selector} selector
 */
var updateSelectorParent = function(selector) {
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
var addToSelector = function(selector, type, val) {
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
var removeFromSelector = function(selector, type, val) {
  selector[type] = selector[type].filter(function(curVal) {
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
var isContainedInSelector = function(selector, type, val) {
  return selector[type].filter(function(curVal) {
    return curVal === val || (curVal.raw && val.raw && curVal.raw === val.raw);
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
    return parse(this.raw);
  }

  updateTag(val) {
    this['tag'] = val || '*';

    var prevTag = parser.getTag(this['raw']);
    if (!prevTag) {
      this['raw'] = val + this['raw'];
    } else {
      this['raw'] = this['raw'].replace(prevTag, val);
    }

    updateSelectorParent(this);
  }

  equalsTag (val) {
    return this['tag'] === val;
  }

  addId(val) {
    addToSelector(this, 'ids', val);
  }

  removeId(val) {
    removeFromSelector(this, 'ids', val);
  }

  containsId(val) {
    return isContainedInSelector(this, 'ids', val);
  }

  addClass(val) {
    addToSelector(this, 'classes', val);
  }

  removeClass(val) {
    removeFromSelector(this, 'classes', val);
  }

  containsClass(val) {
    return isContainedInSelector(this, 'classes', val);
  }

  addPseudoClass(val) {
    addToSelector(this, 'pseudoClasses', val);
  }

  removePseudoClass(val) {
    removeFromSelector(this, 'pseudoClasses', val);
  }

  containsPseudoClass(val) {
    return isContainedInSelector(this, 'pseudoClasses', val);
  }

  addPseudoElement(val) {
    addToSelector(this, 'pseudoElements', val);
  }

  removePseudoElement(val) {
    removeFromSelector(this, 'pseudoElements', val);
  }

  containsPseudoElement(val) {
    return isContainedInSelector(this, 'pseudoElements', val);
  }

  addAttribute(prop, operator, val) {
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
      'property' : prop,
      'value' : val,
      'behaviour' : parser.ATTRIBUTES_OPERATORS[operator],
      'operator' : operator,
      'raw' : raw
    });
  }

  removeAttribute(prop, operator, val) {
    var raw = prop; // TODO: make it possible to pass 'contains' instead of '*='

    if ('' !== operator) {
      raw += operator + val;
    }

    removeFromSelector(this, 'attributes', {
      'property' : prop,
      'value' : val,
      'behaviour' : parser.ATTRIBUTES_OPERATORS[operator],
      'operator' : operator,
      'raw' : raw
    });
  }

  containsAttribute(prop, operator, val) {
    var raw = prop; // TODO: make it possible to pass 'contains' instead of '*='

    if ('' !== operator) {
      raw += operator + val;
    }

    return isContainedInSelector(this, 'attributes', {
      'property' : prop,
      'value' : val,
      'behaviour' : parser.ATTRIBUTES_OPERATORS[operator],
      'operator' : operator,
      'raw' : raw
    });
  }

  addNot(val) {
    val['parent'] = this; // link new not to it's parent
    addToSelector(this, 'nots', val);
  };

  removeNot(val) {
    delete val['parent'];
    removeFromSelector(this, 'nots', val);
  };

  containsNot(val) {
    return isContainedInSelector(this, 'nots', val);
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
    obj['raw'] = parser.getRaw(selector);
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
      if (!selector['nots'][i]['parent']) {
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
