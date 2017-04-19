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

exports.createReport = function(pin, pinDate, uQuery, callback)
{
    console.log('createReport pin='+pin+"  date="+pinDate);

    dataAPI.getHintUsage(pin, pinDate, uQuery, function (err, r) {
        var res = {result:"error", status: 200};
        ret = (err == null && r.ok == 1);
        if (ret) {
            var rptData = r.value;
            var rpt = pug.compileFile('views/report.pug');
            rptData.usedHints.sort();
            res = {result: "ok", status: 200, reportHTML: rpt(rptData), reportData:rptData};

        }
        callback(err,res);
    });
};
