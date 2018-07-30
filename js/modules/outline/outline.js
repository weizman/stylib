var string = require('../../utils/string');
var Inline = require('../inline/inline');

/**
 * class Outline
 *
 * @param {object} str contains string representation of parsed outline style
 */
class Outline {
  constructor(str) {
    var obj = parse(str);

    obj['_raw'] = stringify(obj);

    for (var prop in obj) {
      if (!obj.hasOwnProperty(prop)) {
        continue;
      }

      this[prop] = obj[prop];

      if ('_' === prop[0]) {
        continue;
      }

      // Inline needs to know it's Outline parent
      this[prop]['_parent'] = this;
    }
  }

  stringify() {
    this['_raw'] = stringify(this);
    return this['_raw'];
  }

  parse() {
    return parse(this['_raw']);
  }

  contains(selector, prop) {
    if (undefined === this[selector]) {
      return false;
    }

    if (undefined === prop) {
      return true;
    }

    return undefined !== this[selector][prop];
  }

  get(selector, prop) {
    if (undefined === this[selector]) {
      return undefined;
    }

    if (undefined === prop) {
      return this[selector];
    }

    return this[selector][prop];
  }

  set(prop, val) {
    this[prop] = val;
    this.stringify();
  }

  remove(prop) {
    delete this[prop];
    this.stringify();
  }
}

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

    if (!obj[selector]) {
      obj[selector] = {};
    }

    var rules = string.removeLineBreakers(arr[i + 1]);
    rules = rules.slice(1, rules.length - 1); // get rid of '{' and '}'

    obj[selector] = new Inline(rules);
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

    if ('_' === selector[0]) {
      continue;
    }

    var rules = obj[selector];

    str += selector + ' {\n';

    for (var prop in rules) {
      if (!rules.hasOwnProperty(prop)) {
        continue;
      }

      if ('_' === prop[0]) {
        continue;
      }

      var val = rules[prop];

      str += '\t' + prop + ': ' + val + ';\n';
    }

    str += '}\n';
  }

  return str;
};

module.exports = Outline;
