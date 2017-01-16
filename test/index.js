'use strict';
var har = require("../");
har.fromText(fs.readFileSync("demo.HAR", 'utf-8'),"./dist/");

 