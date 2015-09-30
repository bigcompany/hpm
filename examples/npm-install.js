var packages = require('../');

packages.npm.install(".", {
  packages: ["faker"]
}, function (err, result) {
  console.log(err, result);
})