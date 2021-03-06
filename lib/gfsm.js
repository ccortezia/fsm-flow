'use strict';

module.exports = GFSM;


function *GFSM(map, st0){
  var current = st0, next, ev;

  if (!st0) {
    return null;
  }

  map = map || {};

  while (true) {

    ev = yield current;
    next = map[current][ev];

    if (typeof next == 'undefined') {
      continue;
    }

    if (next === null) {
      return null;
    }

    current = next;
  }
}
