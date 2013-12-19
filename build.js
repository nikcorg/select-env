var fs = require("fs");
var u = require("underscore");
var src = fs.readFileSync("./src/select-env.js", "utf-8");
var tmpl = fs.readFileSync("./src/umd-template.ejs", "utf-8");

process.stdout.write(u.template(tmpl.trim())({ moduleName: "SelectEnv", moduleSrc: src.trim() }) + "\n");
