const pool = require('../config/db');

class SubjectRepository {
  constructor() {
    this.pool = pool;
  }

  async getAll() {
    const [rows] = await this.pool.query('SELECT * FROM subjects');
    return rows;
  }
}

module.exports = SubjectRepository;