describe("inline", function() {
  require = require('requiree')(require);
  var inline = require.dev('../js/modules/inline/inline.js');

  it("should be able to stringify/parse an inline style object/string (1)", function() {
    var inlineStr1 = 'display: none; opacity: 0; background-color: red; ';
    var inlineObj1 = {
      'display' : 'none',
      'opacity' : '0',
      'background-color' : 'red'
    };

    expect(inlineStr1).toEqual(inline.stringify(inlineObj1));
    expect(inlineObj1).toEqual(inline.parse(inlineStr1));
  });
});
