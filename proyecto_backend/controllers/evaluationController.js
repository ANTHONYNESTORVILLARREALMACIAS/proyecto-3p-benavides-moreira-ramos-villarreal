const EvaluationService = require('../services/evaluationService');

class EvaluationController {
  constructor() {
    this.evaluationService = new EvaluationService();
  }

  async create(req, res) {
    const userId = req.user.idUsuario;
    if (!userId) return res.status(401).json({ ok: false, msg: 'not-authenticated' });

    const { idRecurso, fecha_inicio, fecha_fin, instrucciones } = req.body;
    if (!idRecurso) return res.json({ ok: false, msg: 'missing-resource-id' });

    const newEvaluation = { idRecurso, fecha_inicio, fecha_fin, instrucciones };
    const result = await this.evaluationService.create(newEvaluation);
    res.json(result);
  }

  async getByResource(req, res) {
    const userId = req.user.idUsuario;
    if (!userId) return res.status(401).json({ ok: false, msg: 'not-authenticated' });

    const { idRecurso } = req.query;
    if (!idRecurso) return res.json({ ok: false, msg: 'missing-resource-id' });

    const evaluations = await this.evaluationService.getByResource(idRecurso);
    if (!evaluations.length) return res.json({ ok: false, msg: 'evaluations-not-found' });
    res.json({ ok: true, data: evaluations }); // Return array of evaluations
  }

  async update(req, res) {
    const userId = req.user.idUsuario;
    if (!userId) return res.status(401).json({ ok: false, msg: 'not-authenticated' });

    const { idEvaluacion, fecha_inicio, fecha_fin, instrucciones } = req.body;
    if (!idEvaluacion) return res.json({ ok: false, msg: 'missing-evaluation-id' });

    const updatedEvaluation = { idEvaluacion, fecha_inicio, fecha_fin, instrucciones };
    const result = await this.evaluationService.update(updatedEvaluation);
    res.json(result);
  }
}

module.exports = EvaluationController;