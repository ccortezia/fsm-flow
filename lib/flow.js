'use strict';

const util = require('util');
const stream  = require('stream');
const FSM = require('./fsm');

module.exports = FlowFSM;
util.inherits(FlowFSM, stream.Duplex);


// Chain FlowFSM prototype to FSM.
for (let method of Object.keys(FSM.prototype)) {
  if (!FlowFSM.prototype[method]) {
    FlowFSM.prototype[method] = FSM.prototype[method];
  }
}

function FlowFSM(map, st0) {
  stream.Duplex.call(this, {objectMode: true});
  FSM.call(this, map, st0);
  FSM.prototype.on.call(this,
    'changed', onChanged.bind(this));
}

function onChanged(nv, ov) {
  this.push(nv);
  if (nv === null) {
    this.emit('close');
  }
}

FlowFSM.prototype._read = function(){};

FlowFSM.prototype._write = function(chunk, encoding, callback){
  this.touch(chunk.toString('ascii'));
  callback();
};
