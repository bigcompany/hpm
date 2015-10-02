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

npm.spawn = function spawn (output, opts, callback) {

  var hpm = require('../../');

  var npmModule = require('npm');

  hpm.emit('npm::installing', opts);

  var path = require("path");
  var spawn = require('child_process').spawn,
      _npmSpawn  = spawn('install-package-npm', ['-p', JSON.stringify(opts.packages), '-d', opts.where]);

  var notFound = "";
  var erroring = false;
  var success = true;

  _npmSpawn.on('error', function (err) {
    console.log('npm spawn error', err.message);
  });

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
    // stderr here can indicate warning messages, and not actual errors
    erroring = true;
    output.write(data.toString());
    //success = false;
    console.log('stderr: ' + data);
  });

  _npmSpawn.on('close', function (code) {
    console.log('child process exited with code ' + code + 'he' + notFound);
    if (notFound) {
      console.log('calling back with error');
      callback(new Error(opts.packages + ' module not found on npmjs.org'));
    } else {
      if (erroring) {
        // hpm.emit('npm::errored', opts.packages);
      } else {
        hpm.emit('npm::installed', opts);
      }
      if (code > 0) {
        success = false;
      }

      if(success === false) {
        hpm.emit('npm::failed', opts);
      } else {
        hpm.emit('npm::installed', opts);
      }

      callback(null, { output: output, code: code, success: success });
    }
  });

}

npm.exists = function checkRegistry (package, cb) {

  var npmModule = require('npm');
  var config = {};
  // load npm config
  npmModule.load(config, function (err) {
      if (err) { return callback(err); }
      // run npm publish of path

    var start = package.substr(0, 1),
        foundDot = package.search(/\./);

    // TODO: better special char checking
    if ((start === "." || start === "/" || start === "\\") || foundDot !== -1) {
      var str = 'Unable to require modules which aren\'t in the npm registry! \n\n';
      str +=    '    require("' + package + '")\n\n';
      str +=    "A Hook can only consist of a single source file. \n\n";
      str +=    "Any additional files outside of the core Node.js api must be required through npm modules.";
      return cb(new Error(str));
    }
    npmModule.view(package, function(err, res){
      // TODO: better 404 check, this looks brittle
      // the npm registry is a bit strange it's responses
      if (err === "404 Not Found") {
        return cb(null, "false");
      }
      if(err.message.substr(0, 21) === "Registry returned 404") {
        return cb(null, "false");
      }
      if (err) {
        return cb(new Error('Errors communicating with npmjs.org \n\n' + err.message));
      }
      return cb(null, "true");
    });
  });

};
