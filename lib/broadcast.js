/*
  broadcast.js
  
  Simple event listener that listens for all hpm events and broadcasts them to a remote endpoint
  In this example, we use a remote Redis database to store information about package state

*/

module['exports'] = function broadcast () {

  var redis = require("redis"),
      client = redis.createClient();

  var hpm = require('../');
  hpm.onAny(function(data){
    console.log('broadcast event');
    console.log(this.event, data)
  });

  hpm.on('*::installed', function (d) {
    var parts = this.event.split('::');
    var manager = parts[0], action = parts[1];
    // now that we are installed, removed from pending
    return client.hdel("/packages/" + manager + "/pending", d.packages, "", function (err, res){
      if (err) {
        console.log(err.message);
        // return;
      }
      return client.hset("/packages/" + manager + "/installed", d.packages, "", function (err, res) {
        if (err) {
          console.log(err.message);
        }
      });
    });
  });

  hpm.on('*::pending', function (d) {
    var parts = this.event.split('::');
    var manager = parts[0], action = parts[1];
    return client.hset("/packages/" + manager + "/pending", d.packages, "", function (err, res) {
      if (err) {
        console.log(err.message);
      }
    });
  });

  hpm.on('*::failed', function (d) {
    var parts = this.event.split('::');
    var manager = parts[0], action = parts[1];
    // now that the packge failed, remove from pending
    return client.hdel("/packages/" + manager + "/pending", d.packages, "", function (err, res){
      if (err) {
        console.log(err.message);
        // return;
      }
      return client.hset("/packages/" + manager + "/failed", d.packages, "", function (err, res) {
        if (err) {
          console.log(err.message);
        }
      });
    });
  });

};
