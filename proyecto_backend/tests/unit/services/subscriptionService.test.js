const SubscriptionService = require('../../../services/subscriptionService');
const SubscriptionRepository = require('../../../repositories/subscriptionRepository');

jest.mock('../../../repositories/subscriptionRepository');

describe('SubscriptionService', () => {
  let subscriptionService;

  beforeEach(() => {
    subscriptionService = new SubscriptionService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create subscription successfully', async() => {
      const subscriptionData = {
        idUsuario: 1,
        idVariante: 1
      };

      SubscriptionRepository.prototype.create.mockResolvedValue({ id: 1 });

      const result = await subscriptionService.create(subscriptionData);

      expect(result.ok).toBe(true);
      expect(result.id).toBe(1);
    });

    it('should handle creation error', async() => {
      const subscriptionData = {
        idUsuario: 1,
        idVariante: 1
      };

      SubscriptionRepository.prototype.create.mockRejectedValue(new Error('DB error'));

      const result = await subscriptionService.create(subscriptionData);

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('subscription-creation-failed');
    });
  });

  describe('updateState', () => {
    it('should update state successfully', async() => {
      SubscriptionRepository.prototype.pool = {
        query: jest.fn().mockResolvedValue([{ affectedRows: 1 }])
      };

      const result = await subscriptionService.updateState(1, 'activa');

      expect(result.ok).toBe(true);
      expect(result.msg).toBe('subscription-updated');
    });

    it('should return error when subscription not found', async() => {
      SubscriptionRepository.prototype.pool = {
        query: jest.fn().mockResolvedValue([{ affectedRows: 0 }])
      };

      const result = await subscriptionService.updateState(999, 'activa');

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('subscription-not-found');
    });

    it('should handle update error', async() => {
      SubscriptionRepository.prototype.pool = {
        query: jest.fn().mockRejectedValue(new Error('DB error'))
      };

      const result = await subscriptionService.updateState(1, 'activa');

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('subscription-update-failed');
    });
  });

  describe('getUserSubs', () => {
    it('should return user subscriptions', async() => {
      const mockSubscriptions = [{ idSuscripcion: 1, idUsuario: 1 }];
      SubscriptionRepository.prototype.getBy.mockResolvedValue(mockSubscriptions);

      const result = await subscriptionService.getUserSubs(1);

      expect(result).toEqual(mockSubscriptions);
    });

    it('should handle error when getting subscriptions', async() => {
      SubscriptionRepository.prototype.getBy.mockRejectedValue(new Error('DB error'));

      const result = await subscriptionService.getUserSubs(1);

      expect(result).toEqual([]);
    });
  });

  describe('getAll', () => {
    it('should return all subscriptions', async() => {
      const mockSubscriptions = [{ idSuscripcion: 1 }, { idSuscripcion: 2 }];
      SubscriptionRepository.prototype.getAll.mockResolvedValue(mockSubscriptions);

      const result = await subscriptionService.getAll();

      expect(result).toEqual(mockSubscriptions);
    });

    it('should handle error when getting all subscriptions', async() => {
      SubscriptionRepository.prototype.getAll.mockRejectedValue(new Error('DB error'));

      const result = await subscriptionService.getAll();

      expect(result).toEqual([]);
    });
  });
});