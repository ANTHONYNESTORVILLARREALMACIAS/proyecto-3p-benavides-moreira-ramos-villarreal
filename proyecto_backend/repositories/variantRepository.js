const pool = require('../config/db');

class VariantRepository {
  constructor() {
    this.pool = pool;
  }

  async getBy(fields, values) {
    const query = `SELECT * FROM variants WHERE ${fields.map(field => `${field} = ?`).join(' AND ')}`;
    const [rows] = await this.pool.query(query, values);
    return rows;
  }

  async getAll() {
    const [rows] = await this.pool.query('SELECT * FROM variants');
    return rows;
  }
}

module.exports = VariantRepository;