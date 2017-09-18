var string = require('../utils/string');

// convert outline style (css) string to valid outline style (css) object
// from:
// '#MY_DIV {display: none; opacity: 0; background-color: red;} .MY_CLASS_1 , .MY_CLASS_2 {display: block}'
// to:
// {'#MY_DIV' : {'display' : 'none', 'opacity' : 0, 'background-color' : 'red'}, '.MY_CLASS_1 , .MY_CLASS_2' : {'display' : 'block'} }
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

    obj[selector] = {};

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

// convert outline style (css) object to valid outline style (css) string
// from:
// {'#MY_DIV' : {'display' : 'none', 'opacity' : 0, 'background-color' : 'red'}, '.MY_CLASS_1 , .MY_CLASS_2' : {'display' : 'block'} }
// to:
// '#MY_DIV {display: none; opacity: 0; background-color: red;} .MY_CLASS_1 , .MY_CLASS_2 {display: block}'
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
