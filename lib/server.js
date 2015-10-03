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

server.start = function (opts, cb) {
  var hpm = require('../');
  hpm.state = state;
  http.listen(opts, function(err, app) {

    if (err) {
      return cb(err);
    }

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

        var closed = false;
        var where = params.where || ".";

        function spawnInstall (packages) {
          state.npm.pending.push(params.packages);
          hpm.emit('npm::pending', { packages: params.packages, where: where });
          
          // check to see if npm is currently installing a package
          if (state.npm.installing === true) {
            if(closed === true) {
              return;
            } else {
              return res.end('pending installation')
            }
          }

          state.npm.installing = true;

          var opts = {
            where: where,
            packages: packages
          };

          // create a new buffer and output stream for capturing the hook.res.write and hook.res.end calls from inside the hook
          // this is used as an intermediary to pipe hook output to other streams ( such as another hook )
          var output = new streamBuffers.WritableStreamBuffer({
              initialSize: (100 * 1024),        // start as 100 kilobytes.
              incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
          });

          hpm.npm.spawn(output, opts, function (err, result) {
            if (err && !closed) {
              state.npm.errored.push(packages);
              return res.end(err.message);
            }
            if (result.success) {
              // remove from pending
              state.npm.pending = state.npm.pending.filter(function(item){
                return item !== packages;
              });
              // set to allow installs
              state.npm.installing = false;
              // if pending, start install process again
              if (state.npm.pending.length > 0) {
                var p = state.npm.pending.pop();
                spawnInstall(p);
              }
              if(!closed) {
                res.end('sucess');
              }
              closed = true;
            } else {
              res.end('failure');
              //res.end(result.output.getContents());
            }
            //console.log(result.output.getContents());
          });
          
        }
        spawnInstall(params.packages);
      })
    });

    return cb(null, app);

  });
};