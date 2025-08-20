const pool = require('../config/db');

class EvaluationRepository {
  constructor() {
    this.pool = pool;
  }

  async create(evaluation) {
    const [result] = await this.pool.query(
      'INSERT INTO evaluations (idRecurso, fecha_inicio, fecha_fin, instrucciones) VALUES (?, ?, ?, ?)',
      [evaluation.idRecurso, evaluation.fecha_inicio, evaluation.fecha_fin, evaluation.instrucciones]
    );
    return { id: result.insertId };
  }

  async getBy(fields, values) {
    const query = `SELECT * FROM evaluations WHERE ${fields.map(field => `${field} = ?`).join(' AND ')}`;
    const [rows] = await this.pool.query(query, values);
    return rows;
  }
}

module.exports = EvaluationRepository;