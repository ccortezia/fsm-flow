const stream = require('stream');
const FSM = require('../lib/fsm').FSM;
const DuplexFlowFSM = require('../lib/flow').DuplexFlowFSM;


describe('An non-empty valid flow fsm', function(){
  var fsm, acc;

  var map = {
    'st0': {'ev0': null, 'ev1': 'st1', 'ev2': 'st2'},
    'st1': {'ev0': null, 'ev1': null, 'ev3': 'st3'},
    'st2': {'ev0': null, 'ev1': 'st1'},
    'st3': {'ev0': null, 'ev1': 'st1'},
  };

  beforeEach(function(){
    fsm = new DuplexFlowFSM(map, 'st0');
    fsm.init();
    acc = [];
  });

  it('should work in a pipe', function(done){
    var events = ['ev1', 'ev3', 'ev1', 'ev3', 'ev1', 'ev3', 'ev0', null];
    var states = ['st1', 'st3', 'st1', 'st3', 'st1', 'st3'];

    var eventSource = new stream.Readable({
      read: function(n) {
        this.push(events.shift());
      }
    });

    var stateDrain = new stream.Duplex({
      read: function() {
        if (acc.length >= states.length) {
          for (var st of states) this.push(st + '\n');
          states.length = 0;
        }
      },
      write: function(chunk, encoding,  callback) {
        acc.push(chunk.toString('ascii'));
        if (acc.length >= states.length) {
          expect(acc).toEqual(states);
          expect(fsm.done).toBe(true);
          done();
        }
        callback();
      }
    });

    eventSource
      .pipe(fsm)
      .pipe(stateDrain);
  });

});
