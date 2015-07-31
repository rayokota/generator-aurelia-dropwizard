var path = require('path');

var appRoot = '<%= baseName %>-service/src/main/resources/assets/app/';
var outputRoot = '<%= baseName %>-service/target/classes/assets/app/';

module.exports = {
  root: appRoot,
  source: appRoot + '**/*.js',
  html: appRoot + '**/*.html',
  style: '**/*.css',
  output: outputRoot,
  doc:'./doc'
};
