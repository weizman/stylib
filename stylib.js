(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var main = require('./main');

(function(win, doc) {
  if ('object' !== typeof window['SPSL']) {
    window['SPSL'] = {};
    for (var prop in main) {
      if (!main.hasOwnProperty(prop)) {
        continue;
      }

      window['SPSL'][prop] = main[prop];
    }
  }
}(window, document));

},{"./main":2}],2:[function(require,module,exports){
var inline = require('./modules/inline');
var outline = require('./modules/outline');

module.exports.inline = inline;
module.exports.outline = outline;

},{"./modules/inline":3,"./modules/outline":4}],3:[function(require,module,exports){
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

},{"../utils/string":5}],4:[function(require,module,exports){
var string = require('../utils/string');

// convert outline style (css) string to valid outline style (css) object
// from:
// '#MY_DIV {display: none; opacity: 0; background-color: red;} .MY_CLASS_1 , .MY_CLASS_2 {display: block}'
// to:
// {'#MY_DIV' : {'display' : 'none', 'opacity' : 0, 'background-color' : 'red'}, '.MY_CLASS_1 , .MY_CLASS_2' : {'display' : 'block'} }
var parse = function(str) {
  var obj = {};

  var delimitor = Math.random().toString(36).slice(2);

  // trick in order to split string by '{' and '}' but without removing '{' and '}' from the splitted array
  var arr = str.split('{').join(delimitor + '{').split('}').join('}' + delimitor).split(delimitor);
  for (var i = 0; i < arr.length; i += 2) {
    if (i + 1 === arr.length) {
      continue;
    }

    var selector = arr[i].split('\n').join('').split('\r').join('');
    if (!selector) {
      continue;
    }

    obj[selector] = {};

    var rules = arr[i + 1].split('\n').join('').split('\r').join('');
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

    str += selector + ' {';

    for (var prop in rules) {
      if (!rules.hasOwnProperty(prop)) {
        continue;
      }

      var val = rules[prop];

      str += prop + ': ' + val + '; ';
    }

    str += '}\n';
  }

  return str;
};

module.exports.parse = parse;
module.exports.stringify = stringify;

},{"../utils/string":5}],5:[function(require,module,exports){
// get string and return it trimmed (no whitespaces at the beginning/end)
var trim = function(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

module.exports.trim = trim;

},{}]},{},[1]);
