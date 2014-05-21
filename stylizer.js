var stylus = require('stylus');
var fs = require('fs');
var path = require('path');
var prequire = require('parent-require');
var util = require('util');
var cssesc = require('cssesc');
var request = require('request');
var tinylr = require('tiny-lr');

tinylr.Server.prototype.error = function _error (e) {
    if (e.code === "EADDRINUSE") {
        console.log("Looks like livereload server's running already");
    }
};

var makeCSSPath = function (stylFile) {
    var dir = path.dirname(stylFile);
    var filename = path.basename(stylFile, path.extname(stylFile));
    return path.join(dir, filename + '.css');
};

var port = 35729;
var livereload;

var startLivereload = function (infile) {
    if (livereload) return;

    livereload = tinylr();

    livereload.listen(port, function (err) {
        if (err) return console.log("Error: ",err);
        console.log('Started livereload on', port);
    });
};

var watching = {};
var livereloadWatch = function (infile, watchDir, compileFn) {
    if (watching[infile]) return;

    console.log('Setting up watch');
    var gaze = require('gaze');

    gaze(watchDir, function (err, watcher) {
        watcher.on('all', function (event, filepath) {
            console.log('Changed:', filepath);
            var url = 'http://localhost:' + port + '/changed?files=meeting.css';

            if (compileFn) {
                compileFn(function (err) {
                    request.get(url);
                });
            } else {
                request.get(url);
            }
        });
        watching[infile] = true;
        console.log('Watching', watchDir);
    });
};

var cssError = require('./lib/css-error');
var compileStylus = require('./lib/compile-stylus');
// Can be called as
// infile, outfile, done
// infile, outfile, plugins, done
// options, done
module.exports = function (infile, outfile, plugins, done) {
    var options;
    var development = false; //by default
    var watch;

    // When called as (options, done) [recommended]
    if (arguments.length < 3 && typeof infile === 'object' && (typeof outfile === 'function' || typeof outfile === 'undefined')) {
        options = infile;
        done = outfile || function (err) { if (err) throw err; };

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

    if (development && options.watch) {
        startLivereload(infile);
        livereloadWatch(infile, options.watch, function (done) {
            compileStylus({
                infile: infile,
                plugins: plugins
            }, function (err, css) {
                var errMessage;

                if (err) {
                    if (!development) return done(err);
                    css = cssError(err);
                }

                fs.writeFile(outfile, css, done);
            });
        });
    }

    compileStylus({
        infile: infile,
        plugins: plugins
    }, function (err, css) {
        var errMessage;

        if (err) {
            if (!development) return done(err);
            css = cssError(err);
        }

        fs.writeFile(outfile, css, done);
    });
};
