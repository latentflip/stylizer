var path = require('path');
var fs = require('fs');
var cssesc = require('cssesc');

module.exports = function (err) {
    var errMessage = cssesc("Stylizer error: \n\n" + err.message, { escapeEverything: true });
    var css = fs.readFileSync(path.join(__dirname, 'error.css')).toString();
    css += 'body:before { content: "' + errMessage + '"; }';

    return css;
};
