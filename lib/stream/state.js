'use strict';

const util = require('util');
const stream  = require('stream');

module.exports = StateFlowStream;

util.inherits(StateFlowStream, stream.Readable);


function StateFlowStream(fsm) {
  stream.Readable.call(this, {objectMode: true});
  fsm.on('changed', onChanged.bind(this));

  function onChanged(nv, ov) {
    this.push(nv);
    if (nv === null) {
      this.emit('close');
    }
  }
}

StateFlowStream.prototype._read = function(){};
