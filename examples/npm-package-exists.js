var hpm = require('../');

hpm.npm.exists("faker", function (err, result) {
  console.log(err, result);
});