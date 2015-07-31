import {ListViewModel} from '../list-view-model';
import {inject, singleton} from 'aurelia-dependency-injection';
import {AppRouter} from 'aurelia-router';
import {EntityService} from '../entity-service';

@inject(AppRouter, EntityService)
@singleton()
export class <%= _.capitalize(name) %>List extends ListViewModel {
  constructor(router, service) {
    super('<%= pluralize(name) %>', router, service)
  }
}
