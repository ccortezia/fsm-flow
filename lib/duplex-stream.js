var util = require('util');
var stream  = require('stream');
var StateFlowStream = require('../lib/st-stream');
var EventFlowStream = require('../lib/ev-stream');

module.exports = DuplexFlowStream;

util.inherits(DuplexFlowStream, stream.Duplex);


function DuplexFlowStream(fsm) {
  stream.Duplex.call(this, {objectMode: true});

  this.fsm = fsm;
  this.istream = new EventFlowStream(this.fsm);
  this.ostream = new StateFlowStream(this.fsm);
  var self = this;

  this.istream.on('finish', function(){
    self.emit('finish');
  });

  this.ostream.on('close', function(){
    self.emit('close');
  });

  this.ostream.on('end', function(){
    self.emit('end');
  });
}

DuplexFlowStream.prototype._read = function(){
  this.push(this.ostream.read());
}

DuplexFlowStream.prototype._write = function(chunk, encoding, callback){
  this.istream.write(chunk);
  callback();
}
