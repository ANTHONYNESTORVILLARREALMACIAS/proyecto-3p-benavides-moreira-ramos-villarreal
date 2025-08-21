const UserVariantService = require('../../../services/userVariantService');
const UserVariantRepository = require('../../../repositories/userVariantRepository');

jest.mock('../../../repositories/userVariantRepository');

describe('UserVariantService', () => {
  let userVariantService;

  beforeEach(() => {
    userVariantService = new UserVariantService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create user variant successfully', async() => {
      const userVariantData = {
        idUsuario: 1,
        idVariante: 1,
        rol: 'suscriptor'
      };

      UserVariantRepository.prototype.isSubFromVariant.mockResolvedValue(false);
      UserVariantRepository.prototype.isAdminFromVariant.mockResolvedValue(false);
      UserVariantRepository.prototype.create.mockResolvedValue({ id: 1 });

      const result = await userVariantService.create(userVariantData);

      expect(result.ok).toBe(true);
      expect(result.id).toBe(1);
    });

    it('should update existing user variant', async() => {
      const userVariantData = {
        idUsuario: 1,
        idVariante: 1,
        rol: 'admin'
      };

      UserVariantRepository.prototype.isSubFromVariant.mockResolvedValue(true);
      UserVariantRepository.prototype.isAdminFromVariant.mockResolvedValue(false);
      UserVariantRepository.prototype.pool = {
        query: jest.fn().mockResolvedValue([{ affectedRows: 1 }])
      };

      const result = await userVariantService.create(userVariantData);

      expect(result.ok).toBe(true);
      expect(result.msg).toBe('user-variant-updated');
    });

    it('should handle duplicate entry error', async() => {
      const userVariantData = {
        idUsuario: 1,
        idVariante: 1,
        rol: 'suscriptor'
      };

      UserVariantRepository.prototype.isSubFromVariant.mockResolvedValue(false);
      UserVariantRepository.prototype.isAdminFromVariant.mockResolvedValue(false);
      UserVariantRepository.prototype.create.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      const result = await userVariantService.create(userVariantData);

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('user-variant-already-exists');
    });

    it('should handle other creation errors', async() => {
      const userVariantData = {
        idUsuario: 1,
        idVariante: 1,
        rol: 'suscriptor'
      };

      UserVariantRepository.prototype.isSubFromVariant.mockResolvedValue(false);
      UserVariantRepository.prototype.isAdminFromVariant.mockResolvedValue(false);
      UserVariantRepository.prototype.create.mockRejectedValue(new Error('DB error'));

      const result = await userVariantService.create(userVariantData);

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('user-variant-creation-failed');
    });
  });

  describe('updateRole', () => {
    it('should update role successfully', async() => {
      UserVariantRepository.prototype.pool = {
        query: jest.fn().mockResolvedValue([{ affectedRows: 1 }])
      };

      const result = await userVariantService.updateRole(1, 1, 'admin');

      expect(result.ok).toBe(true);
      expect(result.msg).toBe('user-variant-updated');
    });

    it('should return error when user variant not found', async() => {
      UserVariantRepository.prototype.pool = {
        query: jest.fn().mockResolvedValue([{ affectedRows: 0 }])
      };

      const result = await userVariantService.updateRole(999, 1, 'admin');

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('user-variant-not-found');
    });

    it('should handle update error', async() => {
      UserVariantRepository.prototype.pool = {
        query: jest.fn().mockRejectedValue(new Error('DB error'))
      };

      const result = await userVariantService.updateRole(1, 1, 'admin');

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('user-variant-update-failed');
    });
  });

  describe('isAdminFromVariant', () => {
    it('should return true when user is admin', async() => {
      UserVariantRepository.prototype.isAdminFromVariant.mockResolvedValue(true);

      const result = await userVariantService.isAdminFromVariant(1, 1);

      expect(result).toBe(true);
    });
  });

  describe('isSubFromVariant', () => {
    it('should return true when user is subscriber', async() => {
      UserVariantRepository.prototype.isSubFromVariant.mockResolvedValue(true);

      const result = await userVariantService.isSubFromVariant(1, 1);

      expect(result).toBe(true);
    });
  });
});