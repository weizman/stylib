describe("outline", function() {
  require = require('requiree')(require);
  var outline = require.dev('../js/modules/outline.js');

  /**
   * var removeEmptyStrings - get rid of empty strings
   * in order to execute successful comparison
   *
   * @param  {string} str
   * @returns {string}
   */
  var removeEmptyStrings = function(str) {
    return str.replace(/(\r\n|\n|\r)/gm, '').split(' ').join('').split('\t').join('');
  };

  it("should be able to stringify/parse an outline style object/string (1)", function() {
    var outlineStr1 = `#MY_DIV {
      display: none;
      opacity: 0;
      background-color: red;
    }
    .MY_CLASS_1 , .MY_CLASS_2 {
      display: block;
    }
    `;
    var outlineObj1 = {
      '#MY_DIV' :
      {
        'display' : 'none',
        'opacity' : '0',
        'background-color' : 'red'
      },
      '.MY_CLASS_1 , .MY_CLASS_2' :
      {
        'display' : 'block'
      }
    };

    var str1 = removeEmptyStrings(outline.stringify(outlineObj1));
    var str2 = removeEmptyStrings(outlineStr1);
    var obj1 = outlineObj1;
    var obj2 = outline.parse(outlineStr1);

    expect(str1).toEqual(str2);
    expect(obj1).toEqual(obj2);
  });
});
