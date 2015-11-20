var GFSM = require('./gfsm').GFSM;
var StateFlowStream = require('./st-stream');
var EventFlowStream = require('./ev-stream');

exports.FSM = FSM;
exports.FSMFlow = FSMFlow;


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



var util = require('util');
var stream  = require('stream');

util.inherits(FSMFlow, stream.Duplex);


function FSMFlow(map, st0) {
  stream.Duplex.call(this, {objectMode: true});

  this.fsm = new FSM(map, st0);
  var self = this;

  this.fsm.istream.on('finish', function(){
    self.emit('finish');
  });

  this.fsm.ostream.on('close', function(){
    self.emit('close');
  });

  this.fsm.ostream.on('end', function(){
    self.emit('end');
  });
}


FSMFlow.prototype.init = function(){
  this.fsm.init();
};

FSMFlow.prototype.current = function(){
  return this.fsm.current;
};

FSMFlow.prototype.done = function(){
  return this.fsm.done;
};

FSMFlow.prototype._read = function(){
  this.push(this.fsm.ostream.read());
}

FSMFlow.prototype._write = function(chunk, encoding, callback){
  this.fsm.istream.write(chunk);
  callback();
}
