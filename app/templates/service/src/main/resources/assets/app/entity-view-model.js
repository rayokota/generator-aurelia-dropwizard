export class EntityViewModel {
  entityType;
  router;
  service;
  entity;

  constructor(entityType, router, service) {
    this.entityType = entityType;
    this.router = router;
    this.service = service;
  }

  activate(info) {
    var promise;

    // load or create the entity.
    if (info.id === 'new') {
      promise = this.createEmpty();
    } else {
      promise = this.service.get(this.entityType, info.id);
    }

    return promise.then(result => {
      this.entity = result.content;
    });
  }

  canDeactivate() {
    // permit navigating away from unmodified entities.
    return true;
  }

  save() {
    if (this.entity.id) {
      this.service.update(this.entityType, this.entity);
    } else {
      delete this.entity.id
      this.service.create(this.entityType, this.entity);
    }
    Materialize.toast('Changes saved.', 2000)
    this.router.navigate(this.entityType);
  }

  revert() {
    this.router.navigate(this.entityType);
  }

  delete() {
    this.service.delete(this.entityType, this.entity.id);
    this.router.navigate(this.entityType);
  }
}
