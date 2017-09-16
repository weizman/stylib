window.addEventListener('load', function() {
  var cssObj = {'#MY_DIV' : {'display' : 'none', 'opacity' : 0, 'background-color' : 'red'}, '.MY_CLASS_1 , .MY_CLASS_2' : {'display' : 'block'} };
  var inlineObj = {'display' : 'none', 'opacity' : 0, 'background-color' : 'red'};
  var selectorStr = '*, #ID.CLASS, P:hover:nth-child(3n)::wow > SPAN#qq:not(SPAN):not(*.z.a[style*="{1}"][xxx]) ~ P.sss, DIV P, STYLE:empty.class1#id2[style="aaa:click"][style][style^=\'aaa\']';

  var inlineStr = SL.inline.stringify(inlineObj);
  console.log('inline style object:\n %o\n was converted into inline style string:\n "%s"\n', inlineObj, inlineStr);

  var inlineObj = SL.inline.parse(inlineStr);
  console.log('inline style string:\n "%s"\n was converted into inline style object:\n %o\n', inlineStr, inlineObj);

  var cssStr = SL.outline.stringify(cssObj);
  console.log('css (outline style) object:\n %o\n was converted into css (outline style) string:\n "%s"\n', cssObj, cssStr);

  var cssObj = SL.outline.parse(cssStr);
  console.log('css (outline style) string:\n "%s"\n was converted into css (outline style) object:\n %o\n', cssStr, cssObj);

  var selectorObj = SL.selector.parse(selectorStr);
  console.log('selector string:\n "%s"\n was converted into selector object:\n %o\n', selectorStr, selectorObj);
});
