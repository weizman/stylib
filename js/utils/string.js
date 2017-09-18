// get string and return it trimmed (no whitespaces at the beginning/end)
var trim = function(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

var removeLineBreakers = function(str) {
  return str.replace(/(\r\n|\n|\r)/gm, '');
};

module.exports.trim = trim;
module.exports.removeLineBreakers = removeLineBreakers;
