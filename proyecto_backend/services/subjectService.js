const SubjectRepository = require('../repositories/subjectRepository');

class SubjectService {
  constructor() {
    this.subjectRepository = new SubjectRepository();
  }

  async getAll() {
    try {
      const subjects = await this.subjectRepository.getAll();
      return subjects;
    } catch (error) {
      console.error(`SubjectService getAll error: ${error.message}`);
      return [];
    }
  }
}

module.exports = SubjectService;