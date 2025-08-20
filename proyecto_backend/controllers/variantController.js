const VariantService = require('../services/variantService');

class VariantController {
  constructor() {
    this.variantService = new VariantService();
  }

  async getAll(req, res) {
    const userId = req.user.idUsuario;
    if (!userId) return res.status(401).json({ ok: false, msg: 'not-authenticated' });

    const variants = await this.variantService.getAll();
    if (!variants.length) return res.json({ ok: false, msg: 'no-variants-found' });
    res.json({ ok: true, data: variants });
  }

  async getBySubject(req, res) {
    const userId = req.user.idUsuario;
    if (!userId) return res.status(401).json({ ok: false, msg: 'not-authenticated' });

    const { idAsignatura } = req.query;
    if (!idAsignatura) return res.json({ ok: false, msg: 'missing-fields' });

    const variants = await this.variantService.getBySubject(idAsignatura);
    if (!variants.length) return res.json({ ok: false, msg: 'no-variants-found' });
    res.json({ ok: true, data: variants });
  }
}

module.exports = VariantController;