## stylib
stylib - Vast Library For Style Manipulations

# About
`stylib` is a javascript client side library that exports all kind of useful methods that makes
style related actions and manipulations much more simple.

# Dependencies
In order to simply use `stylib`, no dependencies whatsoever required.

In order to edit and work with `stylib`, the following packages must be installed:

1. `browserify` (global):

In order to install `browserify` simply run (trough the command line):

`npm install -g browserify`

2. `google-closure-compiler-js` (global):

In order to install `google-closure-compiler-js` simply run (through the command line):

`npm install -g google-closure-compiler-js`

3. `jasmine` (global):

In order to install `jasmine` simply run (through the command line):

`npm install -g jasmine`

# Install
In order to install `stylib` using `npm`, simply run:

`npm install stylib`

`stylib` build already exist in the repository as `stylib.bundle.js` (or `stylib.bundle.compressed.js` as the
compressed version), so the lib can be used simply by importing the js file without needing to install it.

# Build
To build `stylib` (the uncompressed version), simply build it using `browserify`:

`browserify js/init.js -o stylib.bundle.js` (while current dir is `.\stylib\`).

To build `stylib` (the compressed version), simply build it using `google-closure-compiler-js` (after calling `browserify` first):

`google-closure-compiler-js stylib.bundle.js > stylib.bundle.compressed.js`

# Usage (as a lib)
By including the output file `stylib.bundle.js` (or `stylib.bundle.compressed.js` as the
compressed version), `window['SL']` will be initialized with `stylib` modules.

# Usage (as an npm module)
By requiering `stylib` into a variable, that variable will be initialized with `stylib` modules (`var stylib = require('stylib')`).

# stylib modules
Examples to all this modules could be found in this modules specs files (inside folder `tests`).

1. inline.

Use to parse/stringify inline style represented as string/object.

2. outline.

Use to parse/stringify outline style (css) represented as string/object.

3. Selector.

Use to parse/stringify actual outline style (css) selectors represented as string/object.

# Test
In order to test `stylib` simply call `npm test`.
