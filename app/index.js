'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    _ = require('lodash'),
    _s = require('underscore.string'),
    pluralize = require('pluralize'),
    asciify = require('asciify');

var AureliaDropwizardGenerator = module.exports = function AureliaDropwizardGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.npmInstall();
    this.spawnCommand('jspm', ['install', '-y']);
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AureliaDropwizardGenerator, yeoman.generators.Base);

AureliaDropwizardGenerator.prototype.askFor = function askFor() {

  var cb = this.async();

  console.log('\n' +
    '+-+-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+\n' +
    '|a|u|r|e|l|i|a| |d|r|o|p|w|i|z|a|r|d| |g|e|n|e|r|a|t|o|r|\n' +
    '+-+-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+\n' +
    '\n');

  var prompts = [{
    type: 'input',
    name: 'baseName',
    message: 'What is the base name of your application?',
    default: 'myapp'
  },
  {
    type: 'input',
    name: 'packageName',
    message: 'What is your default package name?',
    default: 'com.mycompany.myapp'
  }];

  this.prompt(prompts, function (props) {
    this.baseName = props.baseName;
    this.packageName = props.packageName;

    cb();
  }.bind(this));
};

AureliaDropwizardGenerator.prototype.app = function app() {

  this.entities = [];
  this.resources = [];
  this.generatorConfig = {
    "baseName": this.baseName,
    "packageName": this.packageName,
    "entities": this.entities,
    "resources": this.resources
  };
  this.generatorConfigStr = JSON.stringify(this.generatorConfig, null, '\t');

  this.template('_generator.json', 'generator.json');
  this.template('_package.json', 'package.json');
  this.copy('gulpfile.js', 'gulpfile.js');
  this.copy('jsconfig.json', 'jsconfig.json');
  this.copy('karma.conf.js', 'karma.conf.js');
  this.copy('gitignore', '.gitignore');
  this.copy('npmignore', '.npmignore');

  var packageFolder = this.packageName.replace(/\./g, '/');
  this.copy('findbugs-exclude.xml', 'findbugs-exclude.xml');
  this.template('_pom.xml', 'pom.xml');

  var buildDir = 'build/';
  this.mkdir(buildDir);
  var tasksDir = buildDir + '/tasks/';
  this.mkdir(tasksDir);
  this.copy('build/args.js', buildDir + 'args.js');
  this.copy('build/babel-options.js', buildDir + 'babel-options.js');
  this.template('build/_paths.js', buildDir + 'paths.js');
  this.copy('build/tasks/build.js', tasksDir + 'build.js');
  this.copy('build/tasks/clean.js', tasksDir + 'clean.js');
  this.copy('build/tasks/dev.js', tasksDir + 'dev.js');
  this.copy('build/tasks/doc.js', tasksDir + 'doc.js');
  this.copy('build/tasks/lint.js', tasksDir + 'lint.js');
  this.copy('build/tasks/prepare-release.js', tasksDir + 'prepare-release.js');
  this.copy('build/tasks/serve.js', tasksDir + 'serve.js');
  this.copy('build/tasks/watch.js', tasksDir + 'watch.js');
  
  var apiDir = this.baseName + '-api/';
  this.mkdir(apiDir);
  this.template('api/_pom.xml', apiDir + 'pom.xml');

  var clientDir = this.baseName + '-client/';
  var clientJavaDir = clientDir + 'src/main/java/' + packageFolder + '/client/';
  this.mkdir(clientJavaDir);
  this.template('client/_pom.xml', clientDir + 'pom.xml');
  this.template('client/src/main/java/package/client/_AppClient.java', clientJavaDir + _s.capitalize(this.baseName) + 'Client.java');

  var serviceDir = this.baseName + '-service/';
  var serviceJavaDir = serviceDir + 'src/main/java/' + packageFolder + '/';
  var serviceConfigDir = serviceJavaDir + 'config/';
  var serviceDaosDir = serviceJavaDir + 'daos/';
  var serviceModelsDir = serviceJavaDir + 'models/';
  var serviceResourcesDir = serviceJavaDir + 'resources/';
  this.mkdir(serviceJavaDir);
  this.mkdir(serviceConfigDir);
  this.mkdir(serviceDaosDir);
  this.mkdir(serviceModelsDir);
  this.mkdir(serviceResourcesDir);
  this.template('service/_pom.xml', serviceDir + 'pom.xml');
  this.template('service/_app.yml', serviceDir + this.baseName + '.yml');
  this.copy('service/spring_loaded/springloaded-1.1.3.jar', serviceDir + 'spring_loaded/springloaded-1.1.3.jar');
  this.copy('service/spring_loaded/springloaded-1.1.4.jar', serviceDir + 'spring_loaded/springloaded-1.1.4.jar');
  this.template('service/src/main/java/package/_AppService.java', serviceJavaDir + _s.capitalize(this.baseName) + 'Service.java');
  this.template('service/src/main/java/package/config/_AppConfiguration.java', serviceConfigDir + _s.capitalize(this.baseName) + 'Configuration.java');

  var resourceDir = serviceDir + 'src/main/resources/';
  var assetsDir = resourceDir + 'assets/';
  var assetsAppDir = assetsDir + 'app/';
  var assetsAppResourcesDir = assetsAppDir + 'resources/';
  var assetsStylesDir = assetsDir + 'styles/';
  this.mkdir(resourceDir);
  this.mkdir(assetsDir);
  this.mkdir(assetsAppDir);
  this.mkdir(assetsAppResourcesDir);
  this.mkdir(assetsStylesDir);
  this.copy('service/src/main/resources/assets/config.js', assetsDir + 'config.js');
  this.copy('service/src/main/resources/assets/index.html', assetsDir + 'index.html');
  this.copy('service/src/main/resources/assets/styles/styles.css', assetsStylesDir + 'styles.css');

  this.template('service/src/main/resources/assets/app/_about.html', assetsAppDir + 'about.html');
  this.copy('service/src/main/resources/assets/app/about.js', assetsAppDir + 'about.js');
  this.copy('service/src/main/resources/assets/app/app.html', assetsAppDir + 'app.html');
  this.template('service/src/main/resources/assets/app/_app.js', assetsAppDir + 'app.js');
  this.copy('service/src/main/resources/assets/app/entity-header.html', assetsAppDir + 'entity-header.html');
  this.template('service/src/main/resources/assets/app/_entity-service.js', assetsAppDir + 'entity-service.js');
  this.copy('service/src/main/resources/assets/app/entity-view-model.js', assetsAppDir + 'entity-view-model.js');
  this.copy('service/src/main/resources/assets/app/list-view-model.js', assetsAppDir + 'list-view-model.js');
  this.copy('service/src/main/resources/assets/app/main.js', assetsAppDir + 'main.js');
  this.copy('service/src/main/resources/assets/app/resources/date-format.js', assetsAppResourcesDir + 'date-format.js');
  this.copy('service/src/main/resources/assets/app/resources/index.js', assetsAppResourcesDir + 'index.js');
  this.copy('service/src/main/resources/assets/app/resources/materialize.js', assetsAppResourcesDir + 'materialize.js');
  this.copy('service/src/main/resources/assets/app/resources/number-format.js', assetsAppResourcesDir + 'number-format.js');
  this.copy('service/src/main/resources/assets/app/resources/pager.html', assetsAppResourcesDir + 'pager.html');
  this.copy('service/src/main/resources/assets/app/resources/pager.js', assetsAppResourcesDir + 'pager.js');

  var cb = this.async();

  asciify(this.baseName, function (err, res) {
    this.banner = res;
    this.template('service/src/main/resources/_banner.txt', resourceDir + 'banner.txt');

    cb();
  }.bind(this));
};

AureliaDropwizardGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
};
