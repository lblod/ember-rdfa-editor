/* jshint node:true */
// var RSVP = require('rsvp');

var simpleGit = require('simple-git')();

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
    require('../compile-css.js'); // Requiring the file compiles
    return new Promise(function(resolve) {
      simpleGit.add(['vendor/ember-rdfa-editor.css'], function() {
        resolve();
      });
    });
  }
};
