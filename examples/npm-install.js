var hpm = require('../');

hpm.npm.spawn(process.stdout, {
  where: "/Users/chroot/",
  packages: ["hook.io-i18n"]
}, function (err, result) {
  console.log(err, result);
})