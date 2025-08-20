const pool = require('../config/db');

class SubscriptionRepository {
  constructor() {
    this.pool = pool;
  }

  async create(subscription) {
    const [result] = await this.pool.query(
      'INSERT INTO subscriptions (idUsuario, idVariante) VALUES (?, ?)',
      [subscription.idUsuario, subscription.idVariante]
    );
    return { id: result.insertId };
  }

  async getBy(fields, values) {
    const query = `SELECT * FROM subscriptions WHERE ${fields.map(field => `${field} = ?`).join(' AND ')}`;
    const [rows] = await this.pool.query(query, values);
    return rows;
  }

  async getAll() {
    const [rows] = await this.pool.query('SELECT * FROM subscriptions');
    return rows;
  }
}

module.exports = SubscriptionRepository;