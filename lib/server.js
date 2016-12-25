var server = {};
module['exports'] = server;

var http = require('resource-http');
var streamBuffers = require('stream-buffers');

// we are going to give the server a non-persistent process state
// this state is used to track which binaries hpm is currently spawning and where they are spawning
// the intention is that we want to create a mutex on package installation per directory/machine
// if we allow multiple instances of the package manager to execute in the same place at once, we may get unexpected results
// we also don't want to allow the hpm to attempt to install the same package while a copy of it is still installing
var state = {};
state.npm = {
  installing: false,
  pending: [],
  errored: []
};

var broadcast = require('./broadcast');

server.start = function (opts, cb) {
  var hpm = require('../');
  hpm.state = state;

  function checkForInstalls () {
    // check to see if anything is waiting to be installed, process it sequentially
    // console.log('check for installs');

    if (state.npm.pending.length > 0) {
      var p = state.npm.pending.pop();

      // create a new buffer and output stream for capturing the hook.res.write and hook.res.end calls from inside the hook
      // this is used as an intermediary to pipe hook output to other streams ( such as another hook )
      var output = new streamBuffers.WritableStreamBuffer({
          initialSize: (100 * 1024),        // start as 100 kilobytes.
          incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
      });
       var _opts = {
          where: __dirname + "", // TODO: hardcode to /var/chroot/node_modules
          packages: p
        };
      hpm.npm.spawn(output, _opts, function (err, result) {
        console.log(err, result)
        console.log(result.output.getContents().toString())
        checkForInstalls();
      })
    } else {
      setTimeout(function(){
        checkForInstalls();
      }, 200);
    }

  }

  checkForInstalls();

  http.listen(opts, function(err, app) {

    if (err) {
      return cb(err);
    }

    broadcast(opts.redis);

    app.post('/npm/exists', function (req, res){
      req.parseRequest(function (err) {
        var params = req.resource.params;
        if (typeof params.packages === "undefined" || params.packages.length === 0) {
          return res.end('packages parameter is required!');
        }
        hpm.npm.exists(params.packages, function(err, result) {
          if (err) {
            return res.end(err.message);
          }
          return res.end(result);
        });
      });
    });

    app.post('/npm/install', function (req, res) {

      req.parseRequest(function(err){
        if (err) {
          return res.end(err.message);
        }
        var params = req.resource.params;

        if (typeof params.packages === "undefined" || params.packages.length === 0) {
          return res.end('packages parameter is required!');
        }
        
        // check to see if npm already has this package queued
        if (state.npm.pending.indexOf(params.packages) !== -1) {
          return res.end(params.packages + ' is already pending installation');
        }

        state.npm.pending.push(params.packages);
        hpm.emit('npm::pending', { packages: params.packages, where: where });

        var closed = false;
        var where = params.where || ".";

        return res.end('is now pending installation')
      });
    });

    return cb(null, app);

  });
};