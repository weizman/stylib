var string = require('../../utils/string');
var parser = require('./parser');
var SelectorUnit = require('./selectorUnit');

/**
 * class Selector
 * representation of a full parsed selector.
 * example for a valid Selector: 'A#id1 , P#.class2'
 *
 * @param {string} str string representation of a selector
 */
class Selector {
  constructor(str) {
    var obj = parse(str);

    for (var prop in obj) {
      this[prop] = obj[prop];
    }
  }

  stringify() {
    return stringify(this);
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

    var selInst = new SelectorUnit(selector, function(str) {return new Selector(str);});

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
  var stringifyRecursive = function(arr) {
    var str = '';

    for (var i in arr) {
      var selector = arr[i];
      str += selector.stringify() + ', ';
    }

    return str;
  };

  var str = stringifyRecursive(arr);
  if (', ' === str.slice(str.length - 2, str.length)) {
    str = str.slice(0, str.length - 2); // cut last redundent comma
  }

  return str;
};

module.exports = Selector;
