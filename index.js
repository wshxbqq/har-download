'use strict';

const mkdirp = require('mkdirp');
const fs = require('fs');
const request = require('request');
const path = require('path');
const url = require('url');

let TIME_OUT = 5000;

function mapMimiType(tp) {
    switch (tp) {
        case "javascript":
            return "js";
            break;
        default:
            return tp;
            break;
    }
}

function getTasks(jsonText, localpath) {
    let har = JSON.parse(jsonText);
    let tasks = [];
    for (let i in har.log.entries) {
        let eobj = har.log.entries[i];
        let urlObj = url.parse(eobj.request.url);

        if (urlObj.pathname.slice(-1) == '/') {
            urlObj.pathname += "index";
        }
        let dirName = path.dirname(urlObj.pathname);
        dirName = path.join(localpath, urlObj.host, dirName);

        let fileName = path.basename(urlObj.pathname);
        fileName = fileName.replace(path.extname(fileName), "");

        let extName = eobj.response.content.mimeType.match(/\w*?$/) || [];
        extName = mapMimiType(extName[0]);
        let t = {
            url: eobj.request.url,
            dirName: dirName,
            fileName: fileName,
            extName: extName,
            text: eobj.response.content.text,
            raw: eobj
        };
        tasks.push(t);
    }
    return tasks;
}

function download(task) {
    return new Promise(function(resolve, reject) {
        mkdirp(task.dirName, function(err) {
            let req = request
                .get(task.url)
                .on('error', function(err) {
                    console.log(err);
                    reject(err);
                })
                .on('end', function() {
                    req.finished = true;
                });
            let timeout = setTimeout(() => {
                if (!req.finished) {
                    req.emit("error", "time out:" + task.url);
                }
            }, TIME_OUT);
            req.pipe(fs.createWriteStream(`${task.dirName}/${task.fileName}.${task.extName}`))
                .on('error', function(err) {
                    console.log(err);
                    reject(err);
                }).on('finish', () => {
                    clearTimeout(timeout);
                    console.log("finish:" + task.url);
                    resolve(resolve)
                });
        });
    })
}

let index = module.exports = {
    fromText: function(jsonText, localpath) {
        let tasks = getTasks(jsonText, localpath);
        let p = Promise.resolve();
        tasks.forEach(function(task, index) {
            p = p.then(function() {
                return download(task);
            }, function(err) {
                console.log(err);
                return download(task);
            });
        });
        p.then(function() {
            console.log(`all finished`);
        });

    },
    init: function(args) {
        if (args.length !== 2) {
            console.log("har-download  demo.HAR  export/folder");
            return;
        }
        let har = fs.readFileSync(args[0], 'utf-8');
        this.fromText(har, args[1]);
    }
};