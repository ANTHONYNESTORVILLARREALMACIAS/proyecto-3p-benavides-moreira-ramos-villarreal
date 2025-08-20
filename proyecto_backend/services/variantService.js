const VariantRepository = require('../repositories/variantRepository');

class VariantService {
  constructor() {
    this.variantRepository = new VariantRepository();
  }

  async getBy(fields, values) {
    try {
      const variants = await this.variantRepository.getBy(fields, values);
      return variants;
    } catch (error) {
      console.error(`VariantService getBy error: ${error.message}`);
      return [];
    }
  }

  async getAll() {
    try {
      const variants = await this.variantRepository.getAll();
      return variants;
    } catch (error) {
      console.error(`VariantService getAll error: ${error.message}`);
      return [];
    }
  }

  async getBySubject(idAsignatura) {
    try {
      const variants = await this.variantRepository.getBy(['idAsignatura'], [idAsignatura]);
      return variants;
    } catch (error) {
      console.error(`VariantService getBySubject error: ${error.message}`);
      return [];
    }
  }
}

module.exports = VariantService;