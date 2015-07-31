import {inject} from './aurelia-dependency-injection';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class App {
  constructor(events) {
    // subscribe to the router's navigation complete event.
    events.subscribe('router:navigation:complete', this.navigationComplete);
  }

  configureRouter(config, router) {
    config.title = '<%= _.capitalize(baseName) %>';
    config.map([
      { route: '', redirect: 'about' },
      { route: 'about', moduleId: './about', nav: true, title: 'About'},
      <% _.each(entities, function (entity) { %>{ route: '<%= pluralize(entity.name) %>',    moduleId: './<%= pluralize(entity.name) %>/<%= pluralize(entity.name) %>-section',       nav: true, title: '<%= _.capitalize(pluralize(entity.name)) %>' },<% }); %>
    ]);
    this.router = router;
  }

  activate() {
  }

  navigationComplete(navigationInstruction) {
    // Enable the materialize "waves" effect on the new page.
    Waves.displayEffect()

    // Track page-views with google-analytics.
    ga('send', 'pageview', '/' + navigationInstruction.fragment);
  }
}
