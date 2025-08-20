const EvaluationRepository = require('../repositories/evaluationRepository');

class EvaluationService {
  constructor() {
    this.evaluationRepository = new EvaluationRepository();
  }

  async create(evaluation) {
    try {
      const result = await this.evaluationRepository.create(evaluation);
      return { ok: true, id: result.id };
    } catch (error) {
      console.error(`EvaluationService create error: ${error.message}`);
      return { ok: false, msg: 'evaluation-creation-failed', error: error.message };
    }
  }

  async getBy(fields, values) {
    try {
      const evaluations = await this.evaluationRepository.getBy(fields, values);
      return evaluations;
    } catch (error) {
      console.error(`EvaluationService getBy error: ${error.message}`);
      return [];
    }
  }

  async getByResource(idRecurso) {
    try {
      const evaluations = await this.evaluationRepository.getBy(['idRecurso'], [idRecurso]);
      return evaluations; // Return all evaluations, not just the first
    } catch (error) {
      console.error(`EvaluationService getByResource error: ${error.message}`);
      return [];
    }
  }

  async update(evaluation) {
    try {
      const [result] = await this.evaluationRepository.pool.query(
        'UPDATE evaluations SET fecha_inicio = ?, fecha_fin = ?, instrucciones = ? WHERE idEvaluacion = ?',
        [evaluation.fecha_inicio, evaluation.fecha_fin, evaluation.instrucciones, evaluation.idEvaluacion]
      );
      if (result.affectedRows === 0) {
        return { ok: false, msg: 'evaluation-not-found' };
      }
      return { ok: true, msg: 'evaluation-updated' };
    } catch (error) {
      console.error(`EvaluationService update error: ${error.message}`);
      return { ok: false, msg: 'evaluation-update-failed', error: error.message };
    }
  }
}

module.exports = EvaluationService;