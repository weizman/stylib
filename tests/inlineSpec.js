describe("inline", function() {
  var Inline = require('../js/modules/inline/inline');

  var expectToBeContained = function(obj1, obj2) {
    for (var prop in obj2) {
      if ('object' === typeof obj1[prop]) {
        expect(obj2[prop]).toBeDefined();
        expectToBeContained(obj1[prop], obj2[prop]);
      } else {
        expect(obj1[prop]).toEqual(obj2[prop]);
      }
    }
  };

  var inlineStr = 'display: none; opacity: 0; background-color: red; ';
  var inlineObj = {
    'display' : 'none',
    'opacity' : '0',
    'background-color' : 'red'
  };

  it("should be able to parse an inline style string", function() {
    var inlineInstance = new Inline(inlineStr);

    expectToBeContained(inlineInstance, inlineObj);
  });

  it("should be able to stringify an inline style object", function() {
    var inlineInstance = new Inline(inlineStr);

    expect(inlineInstance.stringify()).toEqual(inlineStr);
  });

  it('should be able to add/remove selector types to/from a selector instance', function() {
    var inlineInstance = new Inline(inlineStr);

    expect(inlineInstance.contains('display')).toBeTruthy();
    expect(inlineInstance.get('display')).toEqual('none');
    expect(inlineInstance.contains('visibility')).toBeFalsy();
    inlineInstance.set('visibility', 'hidden');
    expect(inlineInstance.contains('visibility')).toBeTruthy();
    inlineInstance.remove('visibility');
    expect(inlineInstance.contains('visibility')).toBeFalsy();
  });
});
