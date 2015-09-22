var mkdirp = require('mkdirp');
var fs = require('fs');
var request = require('request');



var index = module.exports = {

    init: function(args) {
        if(args.length!==2){
            console.log("har-download  demo.HAR  export/folder");
            return;
        }
        var har = fs.readFileSync(args[0], 'utf-8');
        har = JSON.parse(har);

        var tasks = [];

        for (var i in har.log.entries) {
            var eobj = har.log.entries[i];
            var url = eobj.request.url.split('//')[1];

            var dirName = url.split('?')[0].split('/');
            if (dirName.pop() == "") {
                dirName.pop();
            }

            dirName = args[1] + "/" + dirName.join('/');


            var fileName = url.split('/').pop();
            fileName = fileName.split('?')[0];

            if (fileName == "") {
                continue;

            }

            var t = {
                url: eobj.request.url,
                dirName: dirName,
                fileName: fileName
            };
            tasks.push(t);


        }
        var allCount = tasks.length;
        var doneCount = 0;
        var errorCount = 0;

        function worker() {
            var job = tasks.pop();
            if (!job) {
                console.log("all:" + allCount + "     done:" + doneCount + "       error:" + errorCount);

                return;

            }
            mkdirp(job.dirName, function(err) {
                request
                    .get(job.url)
                    .on('error', function(err) {
                        console.log(err);
                        errorCount++;
                        worker();
                    })
                    .on('end', function(err) {
                        console.log("success:" + job.url);
                        doneCount++;
                        worker();
                    })
                    .pipe(fs.createWriteStream(job.dirName + "/" + job.fileName))
                    .on('error', function(err) {
                        console.log(err);
                        errorCount++;
                        worker();
                    })
            });
        }

        worker();
    }
};
