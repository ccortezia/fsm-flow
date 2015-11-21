var util = require('util');
var stream  = require('stream');

module.exports = EventFlowStream;

util.inherits(EventFlowStream, stream.Writable);


function EventFlowStream(fsm) {
  stream.Writable.call(this, {objectMode: true});
  this.fsm = fsm;
}

EventFlowStream.prototype._write = function(chunk, encoding, callback){
  this.fsm.touch(chunk);
  callback();
};
