var string = require('../utils/string');

// convert inline style string to valid inline style object
// from:
// 'display: none; opacity: 0; background-color: red;'
// to:
// {'display' : 'none', 'opacity' : 0, 'background-color' : 'red'}
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

// convert inline style object to valid inline style string
// from:
// {'display' : 'none', 'opacity' : 0, 'background-color' : 'red'}
// to:
// 'display: none; opacity: 0; background-color: red;'
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
