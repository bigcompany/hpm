var hpm = require('../');

hpm.npm.install(".", {
  packages: ["faker"]
}, function (err, result) {
  console.log(err, result);
})