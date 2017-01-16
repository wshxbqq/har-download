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

function download(task, callback) {
    mkdirp(task.dirName, function(err) {
        let headers = {};
        for (let i in task.raw.request.headers) {
            let headObj = task.raw.request.headers[i];
            headers[headObj.name] = headObj.value;
        }
        let options = {
            url: task.url,
            method: task.raw.request.method
        };
        let req = request(options)
            .on('error', function(err) {
                callback({
                    err: err,
                    msg: task
                });
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
                callback(err);
                callback({
                    err: err,
                    msg: task
                });
            }).on('finish', () => {
                clearTimeout(timeout);
                callback({
                    err: false,
                    msg: task
                })
            });
    });
}

let index = module.exports = {
    formFile: function(harPath, localpath, timeout, callback) {
        let har = fs.readFileSync(harPath, 'utf-8');
        this.fromText(har, localpath, timeout, function(err) {
            callback(err);
        });
    },
    fromText: function(jsonText, localpath, timeout, callback) {
        if (typeof(timeout) == "function") {
            callback = timeout;
            timeout = 5000;
        }
        TIME_OUT = timeout || 5000;
        let error = [];
        let tasks = getTasks(jsonText, localpath);

        function loop(task) {
            download(task, function(data) {
                if (data.err) {
                    error.push(data);
                } else {

                }
                let t = tasks.pop();
                if (t) {
                    loop(t);
                } else {
                    callback(error);
                }
            });
        }
        loop(tasks.pop());
    },
    init: function(args) {
        if (args.length !== 2) {
            console.log("har-download  demo.HAR  export/folder");
            return;
        }
        let har = fs.readFileSync(args[0], 'utf-8');
        this.fromText(har, args[1], 10000, function(err) {
            if (err.length) {
                console.log(err);
            } else {
                console.log("finished");
            }
        });
    }
};