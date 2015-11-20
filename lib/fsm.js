var GFSM = require('./gfsm').GFSM;
var StateFlowStream = require('./st-stream');
var EventFlowStream = require('./ev-stream');

exports.FSM = FSM;


function FSM(map, st0){
  this.gfsm = GFSM(map, st0);
  this.initialized = false;
  this.current = undefined;
  this.done = false;
  this.cbmap = {changed: null};
  this.ostream = new StateFlowStream(this);
  this.istream = new EventFlowStream(this);
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
      this.cbmap.changed && this.cbmap.changed(ret.value, oldst);
    this.current = ret.value;
    this.done = ret.done;
    return this.current;
  },

  on(target, callback) {
    if (!(target in this.cbmap)) return;
    this.cbmap[target] = callback;
  }
};
