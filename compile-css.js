var sass = require('node-sass'); // eslint-disable-line
var fs = require('fs');
var path = require('path');

var inputFile = path.join(__dirname, 'app', 'styles', 'ember-rdfa-editor.scss');
var outputFile = path.join(__dirname, 'vendor', 'ember-rdfa-editor.css');
var buf = fs.readFileSync(inputFile, "utf8");

// Compile main file
var result = sass.renderSync({
  data: buf,
  includePaths: ['app/styles']
});

fs.writeFileSync(outputFile, result.css);
