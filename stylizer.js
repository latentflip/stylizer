var stylus = require('stylus');
var fs = require('fs');
var path = require('path');
var prequire = require('parent-require');
var util = require('util');
var cssesc = require('cssesc');

var makeCSSPath = function (stylFile) {
    var dir = path.dirname(stylFile);
    var filename = path.basename(stylFile, path.extname(stylFile));
    return path.join(dir, filename + '.css');
};

var livereload;
var startLivereload = function (infile) {
    if (livereload) return;

    var tinylr = require('tiny-lr');
    livereload = tinylr();
    livereload.listen(35729, function (err) {
        if (err) return;
        console.log('Started livereload on 35729');
    });
};

var watching = {};
var livereloadWatch = function (infile, watchDir) {
    if (watching[infile]) return;

    console.log('Setting up watch');
    var gaze = require('gaze');

    gaze(watchDir, function (err, watcher) {
        watcher.on('all', function (event, filepath) {
            if (livereload) {
                var fakeReq = { body: { files: ['*.css'] }, params: {} };
                var fakeRes = {};
                fakeRes.write = fakeRes.end = function noop (){};
                livereload.changed(fakeReq, fakeRes);
            } else {
                console.log('CSS changed but livreload is not enabled in your browser');
            }
        });
        watching[infile] = true;
        console.log('Watching', watchDir);
    });
};

// Can be called as
// infile, outfile, done
// infile, outfile, plugins, done
// options, done
module.exports = function (infile, outfile, plugins, done) {
    var options;
    var development = false; //by default
    var watch;

    // When called as (options, done) [recommended]
    if (arguments.length === 2 && typeof infile === 'object' && typeof outfile === 'function') {
        options = infile;
        done = outfile;

        if (!options.infile) throw 'infile option required';
        infile = options.infile;

        outfile = options.outfile || makeCSSPath(infile);
        plugins = options.plugins || [];
        development = options.development || development;
        watch = options.watch || watch;
    }

    // When called as (infile, outfile, callback)
    if (arguments.length == 3 && typeof plugins === 'function') {
        done = plugins;
        plugins = [];
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

    if (development && options.watch) {
        startLivereload(infile);
        livereloadWatch(infile, options.watch);
    }


    compiler.render(function (err, css) {
        var errMessage;

        if (err) {
            if (!development) {
                return done(err);
            } else {
                errMessage = cssesc("Stylizer error: \n\n" + err.message, { escapeEverything: true });
                css = fs.readFileSync(path.join(__dirname, 'error.css')).toString();
                css += 'body:before { content: "' + errMessage + '"; }';
            }
        }

        fs.writeFile(outfile, css, done);
    });
};
