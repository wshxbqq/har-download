[![NPM](https://nodei.co/npm/har-download.png?downloads=true)](https://nodei.co/npm/har-download/)

[![NPM version](https://badge.fury.io/js/har-download.png)](http://badge.fury.io/js/har-download) [![Build Status](https://travis-ci.org/jdf2e/har-download.svg?branch=master)](https://travis-ci.org/jdf2e/har-download)


# har-download 从 HAR 文件下载整个网站资源

Download all resources from HAR file 

```bash
har-download  demo.HAR  export/folder
```
此命令将把 demo.HAR 中标记的资源下载到 export/folder 目录里面

### Get HAR from chrome dev tool

![](https://raw.githubusercontent.com/wshxbqq/har-download/master/test/test.png)


## API

__fromText:__

```javascript
const har = require("har");
har.fromText(fs.readFileSync(harString, 'utf-8'), "./outPutDir/", function(err) {
    console.log(err);
});

```

__formFile:__

```javascript
const har = require("har");
har.formFile("demo.HAR", "./outPutDir/", function(err) {
    console.log(err);
});

```

## CLI

```bash
har-download  demo.HAR  export/folder
```

