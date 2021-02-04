/* jshint node:true */
/* eslint-disable node/no-unpublished-require */
const simpleGit = require('simple-git')();
const sass = require('sass');
const fs = require('fs');
const path = require('path');



// For details on each option run `ember help release`
module.exports = {
  // local: true,
  // remote: 'some_remote',
  // annotation: "Release %@",
  // message: "Bumped version to %@",
  manifest: [ 'package.json', 'package-lock.json', 'yuidoc.json' ],
  // publish: true,
  // strategy: 'date',
  // format: 'YYYY-MM-DD',
  // timezone: 'America/Los_Angeles',
  //
  beforeCommit: function (/* project, versions */) {
    var inputFile = path.join(__dirname, '..' , 'app', 'styles', 'ember-rdfa-editor.scss');
    var outputFile = path.join(__dirname, '..', 'vendor', 'ember-rdfa-editor.css');
    var buf = fs.readFileSync(inputFile, "utf8");

    // Compile main file
    var result = sass.renderSync({
      data: buf,
      includePaths: ['app/styles']
    });

    fs.writeFileSync(outputFile, result.css);
    return new Promise(function(resolve) {
      simpleGit.add(['vendor/ember-rdfa-editor.css'], function() {
        resolve();
      });
    });
  }
};
