const pool = require('../config/db');

class UserVariantRepository {
  constructor() {
    this.pool = pool;
  }

  async create(userVariant) {
    const [result] = await this.pool.query(
      'INSERT INTO users_variants (idUsuario, idVariante, rol) VALUES (?, ?, ?)',
      [userVariant.idUsuario, userVariant.idVariante, userVariant.rol]
    );
    return { id: result.insertId };
  }

  async isAdminFromVariant(idUsuario, idVariante) {
    const [rows] = await this.pool.query(
      'SELECT * FROM users_variants WHERE idUsuario = ? AND idVariante = ? AND rol = ?',
      [idUsuario, idVariante, 'admin']
    );
    return rows.length > 0;
  }

  async isSubFromVariant(idUsuario, idVariante) {
    const [rows] = await this.pool.query(
      'SELECT * FROM users_variants WHERE idUsuario = ? AND idVariante = ? AND rol = ?',
      [idUsuario, idVariante, 'suscriptor']
    );
    return rows.length > 0;
  }
}

module.exports = UserVariantRepository;