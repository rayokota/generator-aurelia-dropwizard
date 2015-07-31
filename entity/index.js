'use strict';
var util = require('util'),
    yeoman = require('yeoman-generator'),
    fs = require('fs'),
    _ = require('lodash'),
    _s = require('underscore.string'),
    pluralize = require('pluralize');

var EntityGenerator = module.exports = function EntityGenerator(args, options, config) {
  // By calling `NamedBase` here, we get the argument to the subgenerator call
  // as `this.name`.
  yeoman.generators.NamedBase.apply(this, arguments);

  console.log('You called the entity subgenerator with the argument ' + this.name + '.');

  fs.readFile('generator.json', 'utf8', function (err, data) {
    if (err) {
      console.log('Error: ' + err);
      return;
    }
    this.generatorConfig = JSON.parse(data);
  }.bind(this));
};

util.inherits(EntityGenerator, yeoman.generators.NamedBase);

EntityGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  console.log('\nPlease specify an attribute:');

  var prompts = [{
    type: 'input',
    name: 'attrName',
    message: 'What is the name of the attribute?',
    default: 'myattr'
  },
  {
    type: 'list',
    name: 'attrType',
    message: 'What is the type of the attribute?',
    choices: ['String', 'Integer', 'Long', 'Float', 'Double', 'Boolean', 'Date', 'Enum'],
    default: 'String'
  },
  {
    when: function (props) { return (/String/).test(props.attrType); },
    type: 'input',
    name: 'minLength',
    message: 'Enter the minimum length for the String attribute, or hit enter:',
    validate: function (input) {
      if (input && isNaN(input)) {
        return "Please enter a number.";
      }
      return true;
    }
  },
  {
    when: function (props) { return (/String/).test(props.attrType); },
    type: 'input',
    name: 'maxLength',
    message: 'Enter the maximum length for the String attribute, or hit enter:',
    validate: function (input) {
      if (input && isNaN(input)) {
        return "Please enter a number.";
      }
      return true;
    }
  },
  {
    when: function (props) { return (/Integer|Long|Float|Double/).test(props.attrType); },
    type: 'input',
    name: 'min',
    message: 'Enter the minimum value for the numeric attribute, or hit enter:',
    validate: function (input) {
      if (input && isNaN(input)) {
        return "Please enter a number.";
      }
      return true;
    }
  },
  {
    when: function (props) { return (/Integer|Long|Float|Double/).test(props.attrType); },
    type: 'input',
    name: 'max',
    message: 'Enter the maximum value for the numeric attribute, or hit enter:',
    validate: function (input) {
      if (input && isNaN(input)) {
        return "Please enter a number.";
      }
      return true;
    }
  },
  {
    when: function (props) { return (/Date/).test(props.attrType); },
    type: 'list',
    name: 'dateConstraint',
    message: 'Constrain the date as follows:',
    choices: ['None', 'Past dates only', 'Future dates only'],
    filter: function (input) {
      if (/Past/.test(input)) return 'Past';
      if (/Future/.test(input)) return 'Future';
      return '';
    },
    default: 'None'
  },
  {
    when: function (props) { return (/Enum/).test(props.attrType); },
    type: 'input',
    name: 'enumValues',
    message: 'Enter an enumeration of values, separated by commas'
  },
  {
    type: 'confirm',
    name: 'required',
    message: 'Is the attribute required to have a value?',
    default: true
  },
  {
    type: 'confirm',
    name: 'again',
    message: 'Would you like to enter another attribute or reenter a previous attribute?',
    default: true
  }];

  this.prompt(prompts, function (props) {
    this.attrs = this.attrs || [];
    var attrType = props.attrType;
    this.attrs = _.reject(this.attrs, function (attr) { return attr.attrName === props.attrName; });
    this.attrs.push({ 
      attrName: props.attrName, 
      attrType: attrType, 
      minLength: props.minLength,
      maxLength: props.maxLength,
      min: props.min,
      max: props.max,
      dateConstraint: props.dateConstraint,
      enumValues: props.enumValues ? props.enumValues.split(',') : [],
      required: props.required 
    });

    if (props.again) {
      this.askFor();
    } else {
      cb();
    }
  }.bind(this));
};

EntityGenerator.prototype.files = function files() {

  this.baseName = this.generatorConfig.baseName;
  this.packageName = this.generatorConfig.packageName;
  this.entities = this.generatorConfig.entities;
  this.entities = _.reject(this.entities, function (entity) { return entity.name === this.name; }.bind(this));
  this.entities.push({ name: this.name, attrs: this.attrs});
  this.resources = this.generatorConfig.resources;
  this.pluralize = pluralize;
  this.generatorConfig.entities = this.entities;
  this.generatorConfigStr = JSON.stringify(this.generatorConfig, null, '\t');

  var packageFolder = this.packageName.replace(/\./g, '/');
  this.template('_generator.json', 'generator.json');

  var serviceDir = this.baseName + '-service/';
  var serviceJavaDir = serviceDir + 'src/main/java/' + packageFolder + '/';
  var serviceDaosDir = serviceJavaDir + 'daos/';
  var serviceModelsDir = serviceJavaDir + 'models/';
  var serviceResourcesDir = serviceJavaDir + 'resources/';
  var resourceDir = serviceDir + 'src/main/resources/';
  var assetsDir = resourceDir + 'assets/';
  var assetsAppDir = assetsDir + 'app/';
  this.template('../../app/templates/service/src/main/java/package/_AppService.java', serviceJavaDir + _s.capitalize(this.baseName) + 'Service.java');
  this.template('../../app/templates/service/src/main/resources/assets/app/_app.js', assetsAppDir + 'app.js');

  this.template('service/src/main/java/package/daos/_EntityDAO.java', serviceDaosDir + _s.capitalize(this.name) + 'DAO.java');
  this.template('service/src/main/java/package/models/_Entity.java', serviceModelsDir + _s.capitalize(this.name) + '.java');
  this.template('service/src/main/java/package/resources/_EntityResource.java', serviceResourcesDir + _s.capitalize(this.name) + 'Resource.java');
  _.each(this.attrs, function (attr) {
    if (attr.attrType === 'Enum') {
      this.attr = attr;
      this.template('service/src/main/java/package/models/_AttrEnum.java', serviceModelsDir + _s.capitalize(attr.attrName) + 'Enum.java');
    }
  }.bind(this));

  var resourceDir = serviceDir + 'src/main/resources/';
  var assetsDir = resourceDir + 'assets/';
  var assetsAppDir = assetsDir + 'app/';
  var assetsEntityDir = assetsAppDir + pluralize(this.name) + '/';
  this.mkdir(assetsEntityDir);
  this.template('../../app/templates/service/src/main/resources/assets/app/_app.js', assetsAppDir + 'app.js');
  this.template('service/src/main/resources/assets/app/entities/_entities-section.html', assetsEntityDir + pluralize(this.name) + '-section.html');
  this.template('service/src/main/resources/assets/app/entities/_entities-section.js', assetsEntityDir + pluralize(this.name) + '-section.js');
  this.template('service/src/main/resources/assets/app/entities/_entity-list.html', assetsEntityDir + this.name + '-list.html');
  this.template('service/src/main/resources/assets/app/entities/_entity-list.js', assetsEntityDir + this.name + '-list.js');
  this.template('service/src/main/resources/assets/app/entities/_entity.html', assetsEntityDir + this.name + '.html');
  this.template('service/src/main/resources/assets/app/entities/_entity.js', assetsEntityDir + this.name + '.js');
};
