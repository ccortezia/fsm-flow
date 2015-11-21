var util = require('util');
var stream  = require('stream');

module.exports = StateFlowStream;

util.inherits(StateFlowStream, stream.Readable);


function StateFlowStream(fsm) {
  stream.Readable.call(this, {objectMode: true});
  this.previous = fsm.current;
  fsm.on('changed', onChanged.bind(this));

  function onChanged(nv, ov) {
    this.push(nv);
    if (!nv && typeof nv == 'object') {
      this.emit('close');
    }
  }
}

StateFlowStream.prototype._read = function(){};
