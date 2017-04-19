var pug = require('pug');
var dataAPI = require('../lib/dataAPI');

var exports = module.exports = {};

exports.hashCode = function(s) {
    var hash = 0, i, chr;
    if (s.length === 0) return hash;
    for (i = 0; i < s.length; i++) {
        chr   = s.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

exports.createReport = function(pin, pinDate, callback)
{
    console.log('createReport pin='+pin+"  date="+pinDate);

    dataAPI.getHintUsage(pin, pinDate, function (err, usages) {
        var r = {result:"error", status: 200};
        ret = (err == null && usages.length > 0);
        console.log('createReport usages=' + usages.length);
        if (ret) {
            var rptData = usages[0];
            var rpt = pug.compileFile('views/report.pug');
            rptData.usedHints.sort();
            r = {result: "ok", status: 200, reportHTML: rpt(rptData), reportData:rptData};

        }
        callback(err,r);
    });
};
