const UserVariantService = require('../services/userVariantService');
const VariantService = require('../services/variantService');

class UserVariantController {
  constructor() {
    this.userVariantService = new UserVariantService();
    this.variantService = new VariantService();
  }

  async create(req, res) {
    const userId = req.user.idUsuario;
    if (!userId) {
      console.error('UserVariant create failed: User not authenticated');
      return res.status(401).json({ ok: false, msg: 'not-authenticated' });
    }

    const { idVariante, rol } = req.body;
    if (!idVariante || !rol || !['suscriptor', 'admin'].includes(rol)) {
      console.error(`UserVariant create failed: Invalid fields idVariante=${idVariante}, rol=${rol}`);
      return res.json({ ok: false, msg: 'missing-or-invalid-fields' });
    }

    const variant = await this.variantService.getBy(['idVariante'], [idVariante]);
    if (!variant.length) {
      console.error(`UserVariant create failed: Variant not found for idVariante=${idVariante}`);
      return res.json({ ok: false, msg: 'variant-not-found' });
    }

    try {
      const result = await this.userVariantService.create({ idUsuario: userId, idVariante, rol });
      res.json(result);
    } catch (error) {
      console.error(`UserVariant create failed: ${error.message}`);
      res.json({ ok: false, msg: 'user-variant-creation-failed', error: error.message });
    }
  }

  async updateRole(req, res) {
    const userId = req.user.idUsuario;
    if (!userId) {
      console.error('UserVariant updateRole failed: User not authenticated');
      return res.status(401).json({ ok: false, msg: 'not-authenticated' });
    }

    const { idVariante, rol } = req.body;
    if (!idVariante || !rol || !['suscriptor', 'admin'].includes(rol)) {
      console.error(`UserVariant updateRole failed: Invalid fields idVariante=${idVariante}, rol=${rol}`);
      return res.json({ ok: false, msg: 'missing-or-invalid-fields' });
    }

    const variant = await this.variantService.getBy(['idVariante'], [idVariante]);
    if (!variant.length) {
      console.error(`UserVariant updateRole failed: Variant not found for idVariante=${idVariante}`);
      return res.json({ ok: false, msg: 'variant-not-found' });
    }

    try {
      const result = await this.userVariantService.updateRole(userId, idVariante, rol);
      res.json(result);
    } catch (error) {
      console.error(`UserVariant updateRole failed: ${error.message}`);
      res.json({ ok: false, msg: 'user-variant-update-failed', error: error.message });
    }
  }
}

module.exports = UserVariantController;