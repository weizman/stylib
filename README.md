# stylib
stylib - vast library for style manipulations

# Dependencies
In order to edit and work with `stylib`, the following packages must be installed:

1. browserify (global):

In order to install `browserify` simply run (trough the command line):

`npm install -g browserify`

# Install
In order to install `stylib` using `npm`, simply run:

`npm install stylib`

`stylib` build already exist in the repository as `stylib.bundle.js`, so the lib can be used
simply by importing the js file without needing to install it.

# Build
To build stylib, simply build it using browserify:

`browserify init.js -o stylib.bundle.js` (while current dir is `.\stylib\`).

# Usage (as a lib)
By including the output file `stylib.bundle.js`, `window['SL']` will be initialized with stylib modules.

# Usage (as a npm module)
By requiering stylib into a variable, that varibale will be initialized with stylib modules (`var stylib = require('stylib')`).

# stylib modules

1. inline. 

Use to parse/stringify inline style represented as string/object. For example:

`SL.inline.parse('display: none; opacity: 0; background-color: red;')` will output `{'display' : 'none', 'opacity' : 0, 'background-color' : 'red'}`

`SL.inline.stringify({'display' : 'none', 'opacity' : 0, 'background-color' : 'red'})` will output `'display: none; opacity: 0; background-color: red;'`

2. outline. 

Use to parse/stringify outline style (css) represented as string/object. For example:

`SL.outline.parse('#MY_DIV {display: none; opacity: 0; background-color: red;} .MY_CLASS_1 , .MY_CLASS_2 {display: block}')` will output `{'#MY_DIV' : {'display' : 'none', 'opacity' : 0, 'background-color' : 'red'}, '.MY_CLASS_1 , .MY_CLASS_2' : {'display' : 'block'} }`

`SL.stringify({'#MY_DIV' : {'display' : 'none', 'opacity' : 0, 'background-color' : 'red'}, '.MY_CLASS_1 , .MY_CLASS_2' : {'display' : 'block'} })` will output `'#MY_DIV {display: none; opacity: 0; background-color: red;} .MY_CLASS_1 , .MY_CLASS_2 {display: block}'`

# Example
To see example, simply surf to `./stylib/test/index.html`
