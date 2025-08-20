const pool = require('../config/db');

class ResourceRepository {
  constructor() {
    this.pool = pool;
  }

  async create(resource) {
    const [result] = await this.pool.query(
      'INSERT INTO resources (idVariante, tipo, titulo, descripcion, file_path, creado_por) VALUES (?, ?, ?, ?, ?, ?)',
      [resource.idVariante, resource.tipo, resource.titulo, resource.descripcion, resource.file_path, resource.creado_por]
    );
    return { id: result.insertId };
  }

  async getBy(fields, values) {
    const query = `SELECT * FROM resources WHERE ${fields.map(field => `${field} = ?`).join(' AND ')}`;
    const [rows] = await this.pool.query(query, values);
    return rows;
  }
}

module.exports = ResourceRepository;