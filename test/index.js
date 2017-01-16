'use strict';
const har = require("../");
const fs = require("fs");
const path = require("path");

har.fromText(fs.readFileSync(path.join(__dirname, "demo.HAR"), 'utf-8'), path.join(__dirname, "dist"), function(err) {
    console.log(err);
    har.formFile(path.join(__dirname, "demo.HAR"), path.join(__dirname, "dist1"), function(err) {
        console.log(err);
    });
});