import {EntityViewModel} from '../entity-view-model';
import {transient, inject} from 'aurelia-dependency-injection';
import {AppRouter} from 'aurelia-router';
import {EntityService} from '../entity-service';

@transient()
@inject(AppRouter, EntityService)
export class <%= _.capitalize(name) %> extends EntityViewModel {
  constructor(router, service) {
    super('<%= pluralize(name) %>', router, service);
  }

  createEmpty() {
    return new Promise(
      function(resolve, reject) {
        var result = {
          content: {
            <% _.each(attrs, function (attr) { %> 
            '<%= attr.attrName %>': '',<% }); %>
            'id': ''
          }
        };
        resolve(result);
      }
    );
  }

  get title() {
    if (this.entity && this.entity.id) {
      return '<%= _.capitalize(name) %> #' +  this.entity.id;
    }
    return "New <%= _.capitalize(name) %>";
  }
}
