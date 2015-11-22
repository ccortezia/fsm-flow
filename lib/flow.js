const util = require('util');
const stream  = require('stream');
const FSM = require('./fsm').FSM;

exports.DuplexFlowFSM = DuplexFlowFSM;
util.inherits(DuplexFlowFSM, stream.Duplex);


// Chain DuplexFlowFSM prototype to FSM.
for (var method of Object.keys(FSM.prototype)) {
  if (!DuplexFlowFSM.prototype[method])
    DuplexFlowFSM.prototype[method] = FSM.prototype[method];
}

function DuplexFlowFSM(map, st0) {
  stream.Duplex.call(this, {objectMode: true});
  FSM.call(this, map, st0);
  FSM.prototype.on.call(this,
    'changed', onChanged.bind(this));
}

function onChanged(nv, ov) {
  this.push(nv);
  if (!nv && typeof nv == 'object')
    this.emit('close');
}

DuplexFlowFSM.prototype._read = function(){};

DuplexFlowFSM.prototype._write = function(chunk, encoding, callback){
  this.touch(chunk.toString('ascii'));
  callback();
};
