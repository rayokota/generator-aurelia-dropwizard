import {transient, inject} from 'aurelia-dependency-injection';
import {HttpClient} from 'aurelia-http-client';

@transient()
@inject(HttpClient)
export class EntityService {
  constructor(http){
    this.http = http;
  }

  getAll(entityType) {
    return this.http.get('<%= baseName %>/' + entityType);
  }

  get(entityType, id) {
    return this.http.get('<%= baseName %>/' + entityType + '/' + id);
  }

  create(entityType, entity) {
    return this.http.post('<%= baseName %>/' + entityType, entity);
  }

  update(entityType, entity) {
    return this.http.put('<%= baseName %>/' + entityType + '/' + entity.id, entity);
  }

  delete(entityType, id) {
    return this.http.delete('<%= baseName %>/' + entityType + '/' + id);
  }
}
