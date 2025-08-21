const SubscriptionService = require('../services/subscriptionService');
const UserVariantService = require('../services/userVariantService');
const VariantService = require('../services/variantService');

class SubscriptionController {
  constructor() {
    this.subscriptionService = new SubscriptionService();
    this.userVariantService = new UserVariantService();
    this.variantService = new VariantService();
  }

  async create(req, res) {
    const userId = req.user ? req.user.idUsuario : null;
    if (!userId) {
      console.error('Subscription create failed: User not authenticated');
      return res.status(401).json({ ok: false, msg: 'not-authenticated' });
    }

    const { idVariante } = req.query;
    if (!idVariante) {
      console.error('Subscription create failed: Missing idVariante');
      return res.json({ ok: false, msg: 'missing-fields' });
    }

    const variant = await this.variantService.getBy(['idVariante'], [idVariante]);
    if (!variant.length) {
      console.error(`Subscription create failed: Variant not found for idVariante=${idVariante}`);
      return res.json({ ok: false, msg: 'variant-not-found' });
    }

    const newSubscription = { idUsuario: userId, idVariante };
    const result = await this.subscriptionService.create(newSubscription);
    if (!result.ok) {
      console.error(`Subscription create failed: ${result.msg}`);
      return res.json(result);
    }

    const userVariantResult = await this.userVariantService.create({
      idUsuario: userId,
      idVariante,
      rol: 'suscriptor'
    });

    res.json({ ok: true, subscriptionId: result.id, userVariant: userVariantResult });
  }

  async updateState(req, res) {
    const userId = req.user ? req.user.idUsuario : null;
    if (!userId) {return res.status(401).json({ ok: false, msg: 'not-authenticated' });}

    const { idSuscripcion } = req.query;
    const { state } = req.body;
    if (!idSuscripcion || !state) {return res.json({ ok: false, msg: 'missing-fields' });}

    if (!['activa', 'inactiva'].includes(state)) {
      return res.json({ ok: false, msg: 'invalid-state' });
    }

    const result = await this.subscriptionService.updateState(idSuscripcion, state);
    res.json(result);
  }

  async getUserSubs(req, res) {
    const userId = req.user ? req.user.idUsuario : null;
    if (!userId) {return res.status(401).json({ ok: false, msg: 'not-authenticated' });}

    const subscriptions = await this.subscriptionService.getUserSubs(userId);
    res.json({ ok: true, data: subscriptions });
  }

  async getAll(req, res) {
    const userId = req.user ? req.user.idUsuario : null;
    if (!userId) {return res.status(401).json({ ok: false, msg: 'not-authenticated' });}
    const subscriptions = await this.subscriptionService.getAll();
    res.json({ ok: true, data: subscriptions });
  }
}

module.exports = SubscriptionController;