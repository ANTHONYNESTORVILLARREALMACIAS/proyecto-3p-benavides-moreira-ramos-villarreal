const SubscriptionController = require('../../../controllers/subscriptionController');
const SubscriptionService = require('../../../services/subscriptionService');
const UserVariantService = require('../../../services/userVariantService');
const VariantService = require('../../../services/variantService');

jest.mock('../../../services/subscriptionService');
jest.mock('../../../services/userVariantService');
jest.mock('../../../services/variantService');

describe('SubscriptionController', () => {
  let subscriptionController;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    subscriptionController = new SubscriptionController();
    mockReq = {
      user: { idUsuario: 1 },
      query: {},
      body: {}
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return error when not authenticated', async() => {
      mockReq.user = null;
      await subscriptionController.create(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authenticated' });
    });

    it('should return error when missing variant id', async() => {
      mockReq.query = {};
      await subscriptionController.create(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-fields' });
    });

    it('should return error when variant not found', async() => {
      mockReq.query = { idVariante: 999 };
      VariantService.prototype.getBy.mockResolvedValue([]);
      await subscriptionController.create(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'variant-not-found' });
    });

    it('should create subscription successfully', async() => {
      mockReq.query = { idVariante: 1 };
      VariantService.prototype.getBy.mockResolvedValue([{ idVariante: 1 }]);
      SubscriptionService.prototype.create.mockResolvedValue({ ok: true, id: 1 });
      await subscriptionController.create(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, subscriptionId: 1, userVariant: undefined });
    });

    it('should handle subscription creation failure', async() => {
      mockReq.query = { idVariante: 1 };
      VariantService.prototype.getBy.mockResolvedValue([{ idVariante: 1 }]);
      SubscriptionService.prototype.create.mockResolvedValue({ ok: false, msg: 'creation-failed' });

      await subscriptionController.create(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'creation-failed' });
    });

    it('should handle user variant creation in create', async() => {
      mockReq.query = { idVariante: 1 };
      VariantService.prototype.getBy.mockResolvedValue([{ idVariante: 1 }]);
      SubscriptionService.prototype.create.mockResolvedValue({ ok: true, id: 1 });
      UserVariantService.prototype.create.mockResolvedValue({ ok: true, msg: 'user-variant-created' });

      await subscriptionController.create(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        ok: true,
        subscriptionId: 1,
        userVariant: { ok: true, msg: 'user-variant-created' }
      });
    });
  });

  describe('updateState', () => {
    it('should return error when missing fields', async() => {
      mockReq.query = {};
      mockReq.body = {};
      await subscriptionController.updateState(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-fields' });
    });

    it('should return error when invalid state', async() => {
      mockReq.query = { idSuscripcion: 1 };
      mockReq.body = { state: 'invalid' };
      await subscriptionController.updateState(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'invalid-state' });
    });

    it('should update state successfully', async() => {
      mockReq.query = { idSuscripcion: 1 };
      mockReq.body = { state: 'activa' };
      SubscriptionService.prototype.updateState.mockResolvedValue({ ok: true, msg: 'subscription-updated' });
      await subscriptionController.updateState(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, msg: 'subscription-updated' });
    });

    it('should handle subscription update failure', async() => {
      mockReq.query = { idSuscripcion: 1 };
      mockReq.body = { state: 'activa' };
      SubscriptionService.prototype.updateState.mockResolvedValue({ ok: false, msg: 'update-failed' });

      await subscriptionController.updateState(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'update-failed' });
    });
  });

  describe('getUserSubs', () => {
    it('should return user subscriptions', async() => {
      const mockSubscriptions = [{ idSuscripcion: 1, idUsuario: 1 }];
      SubscriptionService.prototype.getUserSubs.mockResolvedValue(mockSubscriptions);
      await subscriptionController.getUserSubs(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, data: mockSubscriptions });
    });
  });

  describe('getAll', () => {
    it('should return all subscriptions', async() => {
      const mockSubscriptions = [{ idSuscripcion: 1 }, { idSuscripcion: 2 }];
      SubscriptionService.prototype.getAll.mockResolvedValue(mockSubscriptions);
      await subscriptionController.getAll(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, data: mockSubscriptions });
    });
  });
});