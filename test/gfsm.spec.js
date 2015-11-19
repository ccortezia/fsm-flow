
GFSM = require('../lib/gfsm').GFSM;


describe('An empty gfsm', function(){
  var gfsm;

  beforeEach(function(){
    gfsm = GFSM();
  });

  it('should reach its end straight from the boot signal', function(){
    var st = gfsm.next();
    expect(st.value).toEqual(null);
    expect(st.done).toBe(true);
  });

});



describe('An non-empty simple gfsm without a initial state', function(){
  var gfsm;

  beforeEach(function(){
    gfsm = GFSM({'st0': {'ev1': null}});
  });

  it('should reach its end straight from the boot signal', function(){
    var st = gfsm.next();
    expect(st.value).toEqual(null);
    expect(st.done).toBe(true);
  });
});


describe('An non-empty valid gfsm generator', function(){
  var gfsm;
  var map = {
    'st0': {'ev0': null, 'ev1': 'st1', 'ev2': 'st2'},
    'st1': {'ev0': null, 'ev1': null, 'ev3': 'st3'},
    'st2': {'ev0': null, 'ev1': 'st1'},
    'st3': {'ev0': null},
  };

  beforeEach(function(){
    gfsm = GFSM(map, 'st0');
  });

  it('should be on its first state after the boot signal', function(){
    var st = gfsm.next();
    expect(st.value).toEqual('st0');
    expect(st.done).toBe(false);
  });

  it('should ignore a void signal', function(){
    var st;
    st = gfsm.next();
    st = gfsm.next('ev1');
    st = gfsm.next();
    expect(st.value).toEqual('st1');
    st = gfsm.next('ev3');
    st = gfsm.next();
    expect(st.value).toEqual('st3');
    expect(st.done).toBe(false);
  });

  it('should ignore an unknown signal', function(){
    var st;
    st = gfsm.next();
    st = gfsm.next('ev1');
    st = gfsm.next('unknown');
    expect(st.value).toEqual('st1');
    st = gfsm.next('ev3');
    st = gfsm.next('unknown');
    expect(st.value).toEqual('st3');
    expect(st.done).toBe(false);
  });

  it('should reach its end by receiving the proper signals', function(){
    var st;
    gfsm.next();
    gfsm.next('ev1');
    gfsm.next('ev3');
    st = gfsm.next('ev0');
    expect(st.value).toEqual(null);
    expect(st.done).toBe(true);
  });
});
