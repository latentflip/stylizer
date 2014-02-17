# Stylizer

Stylizer makes it super easy to integrate stylus, and stylus plugins, into a node/moonboots project.

## Installation

```
npm install stylizer --save
```

## Usage:

```javascript
var stylizer = require('stylizer');

stylizer({
    infile: '/path/to/infile.styl',      // required, input styl file to build
    outfile: '/path/to/outfile.css',     // optional, output css file, defaults to infile with .css extension
    plugins: ['nib'],                    // optional, array of stylus compatible plugin module names, default: []
    development: true                    // optional, whether to run in development mode, default: false
    watch: '/path/to/stylusfiles/**/*.styl' // optional, enable live reload, see below.
}, function (err) {                      // required, callback to run when built
    console.log('Stylus css written');
});
```


## With moonboots

```javascript
var templatizer = require('templatizer');
var librariesDir = __dirname + '/libraries';
var stylesheetsDir = __dirname + '/public/css';
var stylizer = require('stylizer');

var moonbootsConfig;

moonbootsConfig = {

    //...

    stylesheetsDir: stylesheetsDir,
    stylesheets: [
        stylesheetsDir + '/app.css'
    ],

    beforeBuildCSS: function (done) {
        if (config.isDev) {
            stylizer({
                infile: stylesheetsDir + '/app.styl',
                outfile: stylesheetsDir + '/app.css',
                plugins: ['nib'],
                development: true,
                watch: stylesheetsDir + '/**/*.styl'
            }, function (err) {
                if (err) return console.log(err);
                console.log('CSS written');
            }
        }
    },

    // ...
};
```

## Development mode

Enabling development mode will:

* Not propagate exceptions, to keep your dev server running.
* Create a css file which, on a stylus build failure, hides your app body and replaces it with something like this to help you spot stylus errors easily:

![](https://i.cloudup.com/zAbnCO0dNt-3000x3000.png)

* Enable live reload, as below:

## Live reload:
If `development: true` and `watch:` is defined, live reload events will be sent to connected browsers running the [livereload chrome extension](
http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions-). This means css will autorefresh without a page reload, which is great for development/prototyping.

Currently, `watch` should be a glob matching your stylus files that you want to be watched, e.g: `/path/to/stylus/files/**/*.styl`.

## Plugins

Stylizer supports stylus plugins like nib. To include them, list their module names in the plugins option.

You can write your own plugins. Just create a module, which exports a single function to be called by stylus' [`.use` method](http://learnboost.github.io/stylus/docs/js.html#usefn). See [nib](https://github.com/visionmedia/nib/blob/master/lib/nib.js#L50) for an example.

