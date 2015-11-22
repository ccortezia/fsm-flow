const FSM = require('../lib/fsm');


describe('An empty fsm', function(){
  var fsm;

  beforeEach(function(){
    fsm = new FSM();
  });

  it('should reach its end straight from the boot signal', function(){
    var st = fsm.init();
    expect(st).toEqual(null);
    expect(fsm.done).toBe(true);
  });

});


describe('An non-empty simple fsm without a initial state', function(){
  var fsm;

  beforeEach(function(){
    fsm = new FSM({'st0': {'ev1': null}});
  });

  it('should reach its end straight from the boot signal', function(){
    var st = fsm.init();
    expect(st).toEqual(null);
    expect(fsm.done).toBe(true);
  });
});


describe('An non-empty valid fsm generator', function(){
  var fsm;
  var map = {
    'st0': {'ev0': null, 'ev1': 'st1', 'ev2': 'st2'},
    'st1': {'ev0': null, 'ev1': null, 'ev3': 'st3'},
    'st2': {'ev0': null, 'ev1': 'st1'},
    'st3': {'ev0': null},
  };

  beforeEach(function(){
    fsm = new FSM(map, 'st0');
  });

  it('should be on its first state after the boot signal', function(){
    var st = fsm.init();
    expect(st).toEqual('st0');
    expect(fsm.done).toBe(false);
  });

  it('should ignore a void signal', function(){
    var st;
    st = fsm.init();
    st = fsm.touch('ev1');
    st = fsm.touch();
    expect(st).toEqual('st1');
    st = fsm.touch('ev3');
    st = fsm.touch();
    expect(st).toEqual('st3');
    expect(fsm.done).toBe(false);
  });

  it('should ignore an unknown signal', function(){
    var st;
    st = fsm.init();
    st = fsm.touch('ev1');
    st = fsm.touch('unknown');
    expect(st).toEqual('st1');
    st = fsm.touch('ev3');
    st = fsm.touch('unknown');
    expect(st).toEqual('st3');
    expect(fsm.done).toBe(false);
  });

  it('should reach its end by receiving the proper signals', function(){
    var st;
    fsm.init();
    fsm.touch('ev1');
    fsm.touch('ev3');
    st = fsm.touch('ev0');
    expect(st).toEqual(null);
    expect(fsm.done).toBe(true);
  });
});


describe('A fsm with a "changed" callback installed', function(){
  var fsm, spy;

  beforeEach(function(){
    fsm = new FSM({'A': {'ev0': 'B'}, 'B': {'ev0': null}}, 'A');
    spy = jasmine.createSpy('spy');
    fsm.on('changed', spy);
  });

  it('should trigger "changed" callback upon evolving to a valid state', function(){
    expect(spy.callCount).toBe(0);
    fsm.init();
    expect(spy.callCount).toBe(0);
    fsm.touch('ev0');
    expect(spy.callCount).toBe(1);
    expect(spy.mostRecentCall.args).toEqual(['B', 'A']);
  });

  it('should trigger "changed" callback when evolving past the last state', function(){
    fsm.init();
    fsm.touch('ev0');
    fsm.touch('ev0');
    expect(spy.callCount).toBe(2);
    expect(spy.mostRecentCall.args).toEqual([null, 'B']);
  });

  it('should not trigger "changed" callback when not evolving', function(){
    fsm.init();
    fsm.touch('--');
    expect(spy.callCount).toBe(0);
    fsm.touch('--');
    expect(spy.callCount).toBe(0);
  });
});
