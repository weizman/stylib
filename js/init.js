var stylib = require('./stylib');

(function(win, doc) {
  if ('object' !== typeof window['SL']) {
    window['SL'] = {};
    for (var prop in stylib) {
      if (!stylib.hasOwnProperty(prop)) {
        continue;
      }

      window['SL'][prop] = stylib[prop];
    }
  }
}(window, document));
