var string = require('../../utils/string');

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
