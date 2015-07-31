export class ListViewModel {
  entityType;
  router;
  service;
  entities = [];
  isLoading = false;

  constructor(entityType, router, service) {
    this.entityType = entityType;
    this.router = router;
    this.service = service;
  }

  activate() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.service.getAll(this.entityType)
      .then(result => {
        this.entities = result.content;
        this.isLoading = false;
      });
  }

  open(id) {
    this.router.navigate(this.entityType + '/' + id);
  }
}
