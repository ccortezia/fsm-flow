var FSM = require('../lib/fsm').FSM;
var StateFlowStream = require('../lib/st-stream');
var EventFlowStream = require('../lib/ev-stream');
var DuplexFlowStream = require('../lib/duplex-stream');


describe('An non-empty valid fsm generator stream', function(){
  var fsm, acc;

  var map = {
    'st0': {'ev0': null, 'ev1': 'st1', 'ev2': 'st2'},
    'st1': {'ev0': null, 'ev1': null, 'ev3': 'st3'},
    'st2': {'ev0': null, 'ev1': 'st1'},
    'st3': {'ev0': null, 'ev1': 'st1'},
  };

  beforeEach(function(){
    fsm = new FSM(map, 'st0');
    ostream = new StateFlowStream(fsm);
    istream = new EventFlowStream(fsm);
    fsm.init();
    acc = [];
  });

  function touch() {
    setTimeout(function(){
      fsm.touch('ev1');
      fsm.touch('ev3');
      fsm.touch('ev1');
      fsm.touch('ev3');
      fsm.touch('ev1');
      fsm.touch('ev3');
      fsm.touch('ev0');
    });
  }

  it('should properly stream state changes in paused mode', function(done){
    ostream.on('readable', function(){
      acc.push(ostream.read());
    });

    ostream.on('close', function(){
      // The ending null is present in paused mode.
      expect(acc).toEqual(['st1', 'st3', 'st1', 'st3', 'st1', 'st3', null]);
    });

    ostream.on('end', function(){
      done();
    });

    touch();
  });

  it('should properly stream state changes in flowing mode', function(done){
    ostream.on('data', function(chunk){
      acc.push(chunk);
    });

    ostream.on('close', function(){
      // The ending null is not present in flowing mode.
      expect(acc).toEqual(['st1', 'st3', 'st1', 'st3', 'st1', 'st3']);
    });

    ostream.on('end', function(){
      done();
    });

    touch();
  });

  it('should evolve from streamed events', function(done){
    istream.write('ev1');
    expect(fsm.current).toEqual('st1');
    istream.write('ev0');
    expect(fsm.current).toBe(null);
    istream.end();

    istream.on('finish', function(){
      done();
    });
  });

  it('should properly behave on a pipe', function(done){

    var events = ['ev1', 'ev3', 'ev1', 'ev3', 'ev1', 'ev3', 'ev0', null];
    var states = ['st1', 'st3', 'st1', 'st3', 'st1', 'st3'];

    var eventSource = new require('stream').Readable({
      read: function(n) {
        this.push(events.shift());
      }
    });

    var stateDrain = new require('stream').Writable({
      write: function(chunk, encoding,  callback) {
        chunk = chunk.toString('ascii');
        acc.push(chunk);
        if (acc.length >= states.length) {
          expect(acc).toEqual(states);
          done();
        }
        callback();
      }
    });

    eventSource.pipe(istream);
    ostream.pipe(stateDrain);
  });
});



describe('An non-empty valid flow fsm', function(){
  var fsm, acc;

  var map = {
    'st0': {'ev0': null, 'ev1': 'st1', 'ev2': 'st2'},
    'st1': {'ev0': null, 'ev1': null, 'ev3': 'st3'},
    'st2': {'ev0': null, 'ev1': 'st1'},
    'st3': {'ev0': null, 'ev1': 'st1'},
  };

  beforeEach(function(){
    fsm = new FSM(map, 'st0');
    dstream = new DuplexFlowStream(fsm);
    fsm.init();
    acc = [];
  });

  it('should work in a pipe', function(done){
    var events = ['ev1', 'ev3', 'ev1', 'ev3', 'ev1', 'ev3', 'ev0', null];
    var states = ['st1', 'st3', 'st1', 'st3', 'st1', 'st3'];

    var eventSource = new require('stream').Readable({
      read: function(n) {
        this.push(events.shift());
      }
    });

    var stateDrain = new require('stream').Duplex({
      read: function() {
        if (acc.length >= states.length) {
          for (var st of states) this.push(st + '\n');
          states.length = 0;
        }
      },
      write: function(chunk, encoding,  callback) {
        chunk = chunk.toString('ascii');
        acc.push(chunk);
        if (acc.length >= states.length) {
          expect(acc).toEqual(states);
          expect(fsm.done).toBe(true);
          done();
        }
        callback();
      }
    });

    eventSource
      .pipe(dstream)
      .pipe(stateDrain);
  });

});
