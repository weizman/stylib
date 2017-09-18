/**
 * var trim - get string and return it trimmed (no whitespaces at the beginning/end)
 *
 * @param  {string} str
 * @returns {string}
 */
var trim = function(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

/**
 * var removeLineBreakers - get string and return it without any line breakers (\n\r)
 *
 * @param  {string} str
 * @returns {string}     
 */
var removeLineBreakers = function(str) {
  return str.replace(/(\r\n|\n|\r)/gm, '');
};

module.exports.trim = trim;
module.exports.removeLineBreakers = removeLineBreakers;
