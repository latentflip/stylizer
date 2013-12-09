### Installation

```
npm install stylizer --save
```

### Usage:

```javascript
var stylizer = require('stylizer');

stylizer('/path/to/infile.styl', '/path/to/outfile.css', function () {
    console.log('Stylus css written');
});
```


### With moonboots

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
            try {
                stylizer(stylesheetsDir + '/app.styl', stylesheetsDir + '/app.css', done);
            } catch (e) {
                console.log(e.message);
            }
        }
    },

    // ...
};
```
