FSM = require('../lib/fsm').FSM;


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
    fsm.ostream.on('readable', function(){
      acc.push(fsm.ostream.read());
    });

    fsm.ostream.on('close', function(){
      // The ending null is present in paused mode.
      expect(acc).toEqual(['st1', 'st3', 'st1', 'st3', 'st1', 'st3', null]);
    });

    fsm.ostream.on('end', function(){
      done();
    });

    touch();
  });

  it('should properly stream state changes in flowing mode', function(done){
    fsm.ostream.on('data', function(chunk){
      acc.push(chunk);
    });

    fsm.ostream.on('close', function(){
      // The ending null is not present in flowing mode.
      expect(acc).toEqual(['st1', 'st3', 'st1', 'st3', 'st1', 'st3']);
    });

    fsm.ostream.on('end', function(){
      done();
    });

    touch();
  });

  it('should evolve from streamed events', function(done){
    fsm.istream.write('ev1');
    expect(fsm.current).toEqual('st1');
    fsm.istream.write('ev0');
    expect(fsm.current).toBe(null);
    fsm.istream.end();

    fsm.istream.on('finish', function(){
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

    eventSource.pipe(fsm.istream);
    fsm.ostream.pipe(stateDrain);
  });
});
