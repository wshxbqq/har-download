'use strict';
var har = require("../");
const fs = require("fs");
har.fromText(fs.readFileSync("demo.HAR", 'utf-8'), "./dist/", function(err) {
    console.log(err);
    har.formFile("demo.HAR", "./dist1/", function(err) {
        console.log(err);
    });
});