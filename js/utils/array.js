/**
 * var includes - return whether provided arr includes provided value in it or not
 *
 * @param  {array} arr
 * @param  {*} search
 * @param  {number} [start] index to start search from in arr
 * @returns {boolean}
 */
var includes = function(arr, search, start) {
  if ('number' !== typeof start) {
     start = 0;
   }

   return -1 !== arr.indexOf(search, start);
};

module.exports.includes = includes;
