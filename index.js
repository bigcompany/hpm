var EventEmitter = require('eventemitter2').EventEmitter2;

var hpm = new EventEmitter({
  wildcard: true, // event emitter should use wildcards ( * )
  delimiter: '::', // the delimiter used to segment namespaces
  maxListeners: 20, // the max number of listeners that can be assigned to an event,
  newListener: true
});

hpm.npm = require('./lib/npm');

hpm.broadcast = require('./lib/broadcast');
hpm.server = require('./lib/server');

process.nextTick(function(){
  hpm.broadcast();
});

module['exports'] = hpm;