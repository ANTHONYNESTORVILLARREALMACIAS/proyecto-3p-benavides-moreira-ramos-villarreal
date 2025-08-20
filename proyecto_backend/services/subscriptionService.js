const SubscriptionRepository = require('../repositories/subscriptionRepository');

class SubscriptionService {
  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
  }

  async create(subscription) {
    try {
      const result = await this.subscriptionRepository.create(subscription);
      return { ok: true, id: result.id };
    } catch (error) {
      console.error(`SubscriptionService create error: ${error.message}`);
      return { ok: false, msg: 'subscription-creation-failed', error: error.message };
    }
  }

  async updateState(idSuscripcion, state) {
    try {
      const [result] = await this.subscriptionRepository.pool.query(
        'UPDATE subscriptions SET state = ? WHERE idSuscripcion = ?',
        [state, idSuscripcion]
      );
      if (result.affectedRows === 0) {
        return { ok: false, msg: 'subscription-not-found' };
      }
      return { ok: true, msg: 'subscription-updated' };
    } catch (error) {
      console.error(`SubscriptionService updateState error: ${error.message}`);
      return { ok: false, msg: 'subscription-update-failed', error: error.message };
    }
  }

  async getUserSubs(idUsuario) {
    try {
      const subscriptions = await this.subscriptionRepository.getBy(['idUsuario'], [idUsuario]);
      return subscriptions;
    } catch (error) {
      console.error(`SubscriptionService getUserSubs error: ${error.message}`);
      return [];
    }
  }

  async getAll() {
    try {
      const subscriptions = await this.subscriptionRepository.getAll();
      return subscriptions;
    } catch (error) {
      console.error(`SubscriptionService getAll error: ${error.message}`);
      return [];
    }
  }
}

module.exports = SubscriptionService;