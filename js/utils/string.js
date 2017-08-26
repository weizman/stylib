// get string and return it trimmed (no whitespaces at the beginning/end)
var trim = function(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

module.exports.trim = trim;
