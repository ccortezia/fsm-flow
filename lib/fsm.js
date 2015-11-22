const EventEmitter = require('events');
const GFSM = require('./gfsm');

module.exports = FSM;


function FSM(map, st0){
  this.gfsm = GFSM(map, st0);
  this.initialized = false;
  this.current = undefined;
  this.done = false;
  this.emitter = new EventEmitter();
}


FSM.prototype = {
  constructor: FSM,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    var ret = this.gfsm.next();
    this.current = ret.value;
    this.done = ret.done;
    return this.current;
  },

  touch(ev) {
    var oldst = this.current;
    var ret = this.gfsm.next(ev);
    if (ret.value != oldst)
      this.emitter.emit('changed', ret.value, oldst);
    this.current = ret.value;
    if (this.done = ret.done)
      this.emitter.removeAllListeners();
    return this.current;
  },

  on(target, callback) {
    this.emitter.on(target, callback);
  }
};
