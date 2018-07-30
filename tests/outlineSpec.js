describe("outline", function() {
  var Outline = require('../js/modules/outline/outline');

  var removeEmptyStrings = function(str) {
    return str.replace(/(\r\n|\n|\r)/gm, '').split(' ').join('').split('\t').join('');
  };

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

  var outlineStr = `#MY_DIV {
    display: none;
    opacity: 0;
    background-color: red;
  }
  .MY_CLASS_1 , .MY_CLASS_2 {
    display: block;
  }
  `;
  var outlineObj = {
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

  it("should be able to parse an outline style string", function() {
    var outlineInstance = new Outline(outlineStr);

    expectToBeContained(outlineInstance, outlineObj);
  });

  it("should be able to stringify an outline style object", function() {
    var outlineInstance = new Outline(outlineStr);

    expect(removeEmptyStrings(outlineInstance.stringify())).toEqual(removeEmptyStrings(outlineStr));
  });

  it('should be able to add/remove selector types to/from a selector instance', function() {
    var outlineInstance = new Outline(outlineStr);

    expect(outlineInstance.contains('#MY_DIV')).toBeTruthy();
    expect(outlineInstance.get('#MY_DIV').get('display')).toEqual('none');
    expect(outlineInstance.contains('visibility')).toBeFalsy();
    outlineInstance.set('visibility', 'hidden');
    expect(outlineInstance.contains('visibility')).toBeTruthy();
    outlineInstance.remove('visibility');
    expect(outlineInstance.contains('visibility')).toBeFalsy();
  });

  it('should be able to update an Inline object through an Outline object and make sure to update them both', function() {
    var outlineInstance = new Outline(outlineStr);

    expect(outlineInstance['_raw'].includes('visibility')).toBeFalsy();
    outlineInstance.get('#MY_DIV').set('visibility', 'hidden');
    expect(outlineInstance['_raw'].includes('visibility')).toBeTruthy();
  });
});
