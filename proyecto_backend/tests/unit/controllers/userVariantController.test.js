const UserVariantController = require('../../../controllers/userVariantController');
const UserVariantService = require('../../../services/userVariantService');
const VariantService = require('../../../services/variantService');

jest.mock('../../../services/userVariantService');
jest.mock('../../../services/variantService');

describe('UserVariantController', () => {
  let userVariantController;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    userVariantController = new UserVariantController();
    mockReq = {
      user: { idUsuario: 1 },
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
      await userVariantController.create(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authenticated' });
    });

    it('should return error when missing or invalid fields', async() => {
      mockReq.body = { idVariante: 1 };
      await userVariantController.create(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-or-invalid-fields' });
    });

    it('should return error when variant not found', async() => {
      mockReq.body = { idVariante: 999, rol: 'suscriptor' };
      VariantService.prototype.getBy.mockResolvedValue([]);
      await userVariantController.create(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'variant-not-found' });
    });

    it('should create user variant successfully', async() => {
      mockReq.body = { idVariante: 1, rol: 'suscriptor' };
      VariantService.prototype.getBy.mockResolvedValue([{ idVariante: 1 }]);
      UserVariantService.prototype.create.mockResolvedValue({ ok: true, id: 1, msg: 'user-variant-created' });
      await userVariantController.create(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, id: 1, msg: 'user-variant-created' });
    });

    it('should handle user variant creation failure', async() => {
      mockReq.body = { idVariante: 1, rol: 'suscriptor' };
      VariantService.prototype.getBy.mockResolvedValue([{ idVariante: 1 }]);
      UserVariantService.prototype.create.mockResolvedValue({ ok: false, msg: 'creation-failed' });

      await userVariantController.create(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'creation-failed' });
    });

    it('should handle specific error types in create', async() => {
      mockReq.body = { idVariante: 1, rol: 'suscriptor' };
      VariantService.prototype.getBy.mockResolvedValue([{ idVariante: 1 }]);
      UserVariantService.prototype.create.mockResolvedValue({
        ok: false,
        msg: 'user-variant-already-exists'
      });

      await userVariantController.create(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        ok: false,
        msg: 'user-variant-already-exists'
      });
    });
  });

  describe('updateRole', () => {
    it('should return error when missing or invalid fields', async() => {
      mockReq.body = { idVariante: 1 };
      await userVariantController.updateRole(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-or-invalid-fields' });
    });

    it('should update role successfully', async() => {
      mockReq.body = { idVariante: 1, rol: 'admin' };
      VariantService.prototype.getBy.mockResolvedValue([{ idVariante: 1 }]);
      UserVariantService.prototype.updateRole.mockResolvedValue({ ok: true, msg: 'user-variant-updated' });
      await userVariantController.updateRole(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, msg: 'user-variant-updated' });
    });

    it('should handle variant not found in updateRole', async() => {
      mockReq.body = { idVariante: 999, rol: 'admin' };
      VariantService.prototype.getBy.mockResolvedValue([]);

      await userVariantController.updateRole(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'variant-not-found' });
    });

    it('should handle user variant update failure', async() => {
      mockReq.body = { idVariante: 1, rol: 'admin' };
      VariantService.prototype.getBy.mockResolvedValue([{ idVariante: 1 }]);
      UserVariantService.prototype.updateRole.mockResolvedValue({ ok: false, msg: 'update-failed' });

      await userVariantController.updateRole(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'update-failed' });
    });
  });
});