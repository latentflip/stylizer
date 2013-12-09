var stylus = require('stylus');
var fs = require('fs');
var path = require('path');
var prequire = require('parent-require');
var util = require('util');

module.exports = function (infile, outfile, plugins, done) {

    if (!done) {
        if (typeof plugins === 'function') {
            done = plugins;
            plugins = [];
        }
    }

    var styl = fs.readFileSync(infile);

    var compiler = stylus(styl.toString())
                    .set('paths', [ path.dirname(infile) ])
                    .set('include css', true);

    if (util.isArray(plugins)) {
        plugins.forEach(function (plugin) {
            var p = prequire(plugin);
            compiler.use(p());
        });
    } else {
        Object.keys(plugins).forEach(function (plugin) {
            var p = prequire(plugin);
            compiler.use(p(plugins[plugin]));
        });
    }

    compiler.render(function (err, css) {
        if (err) throw err;

        fs.writeFile(outfile, css, done);
    });
};
