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
    acc = [];
  });

  function touch() {
    setTimeout(function(){
      fsm.init();
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
});
