var npm = {};
module['exports'] = npm;

npm.install = function install (where, opts, callback) {
  var npmModule = require('npm');
  var config = {};
  // load npm config
  npmModule.load(config, function (err) {
    if (err) { return callback(err); }
    // run npm publish of path
    if (typeof opts.packages === "string") {
      opts.packages = [opts.packages];
    }
    npmModule.commands.install(where, opts.packages, callback);
  });
}

npm.view = function (package, cb) {
  var npmModule = require('npm');
  npmModule.load({}, function (err) {
    if (err) { return cb(err); }
    npmModule.commands.view([package], cb);
  });
};

npm.spawn = function install (output, opts, callback) {

  var npmModule = require('npm');

  var path = require("path");
  var spawn = require('child_process').spawn,
      _npmSpawn    = spawn('install-package-npm', ['-p', JSON.stringify(opts.packages), '-d', opts.where]);

  var notFound = "";

  //console.log('installing ', opts.where, opts.packages)
  _npmSpawn.stdout.on('data', function (data) {
    
    output.write(data.toString());
    if (data.toString().substr(0, 3) === "404") {
      notFound = "404 Not Found";
    }
    console.log('stdout: ' + data);
  });

  _npmSpawn.stderr.on('data', function (data) {
    //process.stderr.write(data.toString());
    output.write(data.toString());
    console.log('stderr: ' + data);
  });

  _npmSpawn.on('close', function (code) {
    console.log('child process exited with code ' + code + 'he' + notFound);
    if (notFound) {
      console.log('calling back with error');
      callback(new Error(opts.packages + ' module not found on npmjs.org'));
    } else {
      callback(null);
    }
  });

}