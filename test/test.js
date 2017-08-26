window.addEventListener('load', function() {
  var cssObj = {'#MY_DIV' : {'display' : 'none', 'opacity' : 0, 'background-color' : 'red'}, '.MY_CLASS_1 , .MY_CLASS_2' : {'display' : 'block'} };
  var inlineObj = {'display' : 'none', 'opacity' : 0, 'background-color' : 'red'};

  var inlineStr = SPSL.inline.stringify(inlineObj);
  console.log('inline style object:\n %o\n was converted into inline style string:\n "%s"\n', inlineObj, inlineStr);

  var inlineObj = SPSL.inline.parse(inlineStr);
  console.log('inline style string:\n "%s"\n was converted into inline style object:\n %o\n', inlineStr, inlineObj);

  var cssStr = SPSL.outline.stringify(cssObj);
  console.log('css (outline style) object:\n %o\n was converted into css (outline style) string:\n "%s"\n', cssObj, cssStr);

  var cssObj = SPSL.outline.parse(cssStr);
  console.log('css (outline style) string:\n "%s"\n was converted into css (outline style) object:\n %o\n', cssStr, cssObj);
});
