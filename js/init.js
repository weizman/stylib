var main = require('./main');

(function(win, doc) {
  if ('object' !== typeof window['SL']) {
    window['SL'] = {};
    for (var prop in main) {
      if (!main.hasOwnProperty(prop)) {
        continue;
      }

      window['SL'][prop] = main[prop];
    }
  }
}(window, document));
