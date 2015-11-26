# fsm-flow

[![build status](https://secure.travis-ci.org/ccortezia/fsm-flow.png)](http://travis-ci.org/ccortezia/fsm-flow)
[![Coverage Status](https://coveralls.io/repos/ccortezia/fsm-flow/badge.svg?branch=master)](https://coveralls.io/r/ccortezia/fsm-flow?branch=master)

A stream friendly Finite State Machine implementation.

Consider the following FSM map representation:
```js
const stateMap = {
  ice: {heat: 'water', consume: null},
  water: {heat: 'steam', cold: 'ice', consume: null},
  steam: {cold: 'water', consume: null},
};
```

Below is an usual FSM example, nothing new.

```js
const FSM = require('fsm-flow').FSM;

// Create a simple machine from a map and a initial state
var fsm = new FSM(stateMap, 'water');

// Evolve the machine
fsm.touch('heat'); // steam
fsm.touch('cold'); // water
fsm.touch('cold'); // ice

// Handle state changes normally.
fsm.on('changed', function(nv, ov){
  // Do your thing.
});

```

Now a more interesting stream capable FSM example (stream interface):

```js
const FSM = require('fsm-flow').FlowFSM;

// Create a simple machine from a map and a initial state
var fsm = new FSM(stateMap, 'water');

// Create some dummy Readable stream
var events = ['heat', 'heat', 'cold', 'cold', 'consume'];

var eventSource = require('stream').Readable({
  read: function(n) {
    this.push(events.shift());
  }
});

// Use the machine as a stream pipeline stage.
eventSource.pipe(fsm).pipe(process.stdout);

```
