const pool = require('../config/db');

class UserRepository {
  constructor() {
    this.pool = pool;
  }

  async create(user) {
    const [result] = await this.pool.query(
      'INSERT INTO users (username, password, email, born_date) VALUES (?, ?, ?, ?)',
      [user.username, user.password, user.email, user.born_date]
    );
    return { id: result.insertId };
  }

  async getBy(fields, values) {
    const query = `SELECT * FROM users WHERE ${fields.map(field => `${field} = ?`).join(' AND ')}`;
    const [rows] = await this.pool.query(query, values);
    return rows;
  }
}

module.exports = UserRepository;