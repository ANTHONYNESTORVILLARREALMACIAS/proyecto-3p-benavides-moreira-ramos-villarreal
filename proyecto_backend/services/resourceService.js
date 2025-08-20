const ResourceRepository = require('../repositories/resourceRepository');

class ResourceService {
  constructor() {
    this.resourceRepository = new ResourceRepository();
  }

  async create(resource) {
    try {
      const result = await this.resourceRepository.create(resource);
      return { ok: true, id: result.id };
    } catch (error) {
      console.error(`ResourceService create error: ${error.message}`);
      return { ok: false, msg: 'resource-creation-failed', error: error.message };
    }
  }

  async getBy(fields, values) {
    try {
      const resources = await this.resourceRepository.getBy(fields, values);
      return resources;
    } catch (error) {
      console.error(`ResourceService getBy error: ${error.message}`);
      return [];
    }
  }

  async getByVariant(idVariante) {
    try {
      const resources = await this.resourceRepository.getBy(['idVariante'], [idVariante]);
      return resources;
    } catch (error) {
      console.error(`ResourceService getByVariant error: ${error.message}`);
      return [];
    }
  }

  async delete(idRecurso) {
    try {
      const [result] = await this.resourceRepository.pool.query(
        'DELETE FROM resources WHERE idRecurso = ?',
        [idRecurso]
      );
      if (result.affectedRows === 0) {
        return { ok: false, msg: 'resource-not-found' };
      }
      return { ok: true, msg: 'resource-deleted' };
    } catch (error) {
      console.error(`ResourceService delete error: ${error.message}`);
      return { ok: false, msg: 'resource-deletion-failed', error: error.message };
    }
  }
}

module.exports = ResourceService;