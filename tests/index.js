var Mocha = require("mocha");
var fs = require("fs");
var path = require("path");

var mocha = new Mocha();

fs.readdirSync(__dirname).filter(function (file) {
    return !(/index\.js$/.test(file));
}).
forEach(function (file) {
    mocha.addFile(path.join(__dirname, file));
});

mocha.run(function (failures) {
    process.on('exit', function () {
        process.exit(failures);
    });
});
