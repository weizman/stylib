var string = require('../../utils/string');

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
