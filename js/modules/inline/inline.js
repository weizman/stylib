var string = require('../../utils/string');

/**
 * class Inline
 *
 * @param {object} str contains string representation of inline style to parse
 */
class Inline {
  constructor(str) {
    var obj = parse(str);

    obj['_raw'] = stringify(obj);

    for (var prop in obj) {
      if (!obj.hasOwnProperty(prop)) {
        continue;
      }

      this[prop] = obj[prop];
    }
  }

  stringify() {
    this['_raw'] = stringify(this);

    if (this['_parent']) {
      // Inline has an Outline parent? it should also be updated
      this['_parent'].stringify();
    }

    return this['_raw'];
  }

  parse() {
    return parse(this['_raw']);
  }

  contains(prop) {
    return undefined !== this[prop];
  }

  get(prop) {
    return this[prop];
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

    if ('_' === prop[0]) {
      continue;
    }

    var val = obj[prop];

    str += prop + ': ' + val + '; ';
  }

  return str;
};

module.exports = Inline;
