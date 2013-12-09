var stylus = require('stylus');
var fs = require('fs');
var path = require('path');

module.exports = function (infile, outfile) {
    var styl = fs.readFileSync(infile);
    stylus(styl.toString())
    .set('paths', [ path.dirname(infile) ])
    .set('include css', true)
    .render(function (err, css) {
        if (err) throw err;

        fs.writeFileSync(outfile, css);
    });
};
