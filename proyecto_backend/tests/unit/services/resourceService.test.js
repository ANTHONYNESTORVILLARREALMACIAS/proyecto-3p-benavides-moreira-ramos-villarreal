const ResourceService = require('../../../services/resourceService');
const ResourceRepository = require('../../../repositories/resourceRepository');

jest.mock('../../../repositories/resourceRepository');

describe('ResourceService', () => {
  let resourceService;

  beforeEach(() => {
    resourceService = new ResourceService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create resource successfully', async() => {
      const resourceData = {
        idVariante: 1,
        tipo: 'pdf',
        titulo: 'Test',
        descripcion: 'Test desc',
        file_path: 'uploads/test.pdf',
        creado_por: 1
      };

      ResourceRepository.prototype.create.mockResolvedValue({ id: 1 });

      const result = await resourceService.create(resourceData);

      expect(result.ok).toBe(true);
      expect(result.id).toBe(1);
    });

    it('should handle creation error', async() => {
      const resourceData = {
        idVariante: 1,
        tipo: 'pdf',
        titulo: 'Test',
        descripcion: 'Test desc',
        file_path: 'uploads/test.pdf',
        creado_por: 1
      };

      ResourceRepository.prototype.create.mockRejectedValue(new Error('DB error'));

      const result = await resourceService.create(resourceData);

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('resource-creation-failed');
    });
  });

  describe('getBy', () => {
    it('should return resources', async() => {
      const mockResources = [{ id: 1, titulo: 'Test' }];
      ResourceRepository.prototype.getBy.mockResolvedValue(mockResources);

      const result = await resourceService.getBy(['idVariante'], [1]);

      expect(result).toEqual(mockResources);
    });

    it('should handle getBy error', async() => {
      ResourceRepository.prototype.getBy.mockRejectedValue(new Error('DB error'));

      const result = await resourceService.getBy(['idVariante'], [1]);

      expect(result).toEqual([]);
    });
  });

  describe('getByVariant', () => {
    it('should return resources by variant', async() => {
      const mockResources = [{ id: 1, idVariante: 1 }];
      ResourceRepository.prototype.getBy.mockResolvedValue(mockResources);

      const result = await resourceService.getByVariant(1);

      expect(result).toEqual(mockResources);
    });

    it('should handle error when getting resources by variant', async() => {
      ResourceRepository.prototype.getBy.mockRejectedValue(new Error('DB error'));

      const result = await resourceService.getByVariant(1);

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete resource successfully', async() => {
      ResourceRepository.prototype.pool = {
        query: jest.fn().mockResolvedValue([{ affectedRows: 1 }])
      };

      const result = await resourceService.delete(1);

      expect(result.ok).toBe(true);
      expect(result.msg).toBe('resource-deleted');
    });

    it('should return error when resource not found', async() => {
      ResourceRepository.prototype.pool = {
        query: jest.fn().mockResolvedValue([{ affectedRows: 0 }])
      };

      const result = await resourceService.delete(999);

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('resource-not-found');
    });

    it('should handle deletion error', async() => {
      ResourceRepository.prototype.pool = {
        query: jest.fn().mockRejectedValue(new Error('DB error'))
      };

      const result = await resourceService.delete(1);

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('resource-deletion-failed');
    });
  });
});