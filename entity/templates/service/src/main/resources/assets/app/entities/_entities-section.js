/**
* The shell for the <%= pluralize(name) %> section of the application. 
*/
export class <%= _.capitalize(pluralize(name)) %>Section {
  configureRouter(config, router) {
    config.map([
      { route: '',    moduleId: './<%= name %>-list', nav: false, title: '' },
      { route: ':id', moduleId: './<%= name %>',      nav: false, title: '' },
    ]);
  }
}
