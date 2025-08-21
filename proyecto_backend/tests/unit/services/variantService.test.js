const VariantService = require('../../../services/variantService');
const VariantRepository = require('../../../repositories/variantRepository');

jest.mock('../../../repositories/variantRepository');

describe('VariantService', () => {
  let variantService;

  beforeEach(() => {
    variantService = new VariantService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBy', () => {
    it('should return variants by criteria', async() => {
      const mockVariants = [{ idVariante: 1, nombre: 'Variant 1' }];
      VariantRepository.prototype.getBy.mockResolvedValue(mockVariants);

      const result = await variantService.getBy(['idAsignatura'], [1]);

      expect(result).toEqual(mockVariants);
    });

    it('should handle error when getting variants', async() => {
      VariantRepository.prototype.getBy.mockRejectedValue(new Error('DB error'));

      const result = await variantService.getBy(['idAsignatura'], [1]);

      expect(result).toEqual([]);
    });
  });

  describe('getAll', () => {
    it('should return all variants', async() => {
      const mockVariants = [{ idVariante: 1 }, { idVariante: 2 }];
      VariantRepository.prototype.getAll.mockResolvedValue(mockVariants);

      const result = await variantService.getAll();

      expect(result).toEqual(mockVariants);
    });

    it('should handle error when getting all variants', async() => {
      VariantRepository.prototype.getAll.mockRejectedValue(new Error('DB error'));

      const result = await variantService.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getBySubject', () => {
    it('should return variants by subject', async() => {
      const mockVariants = [{ idVariante: 1, idAsignatura: 1 }];
      VariantRepository.prototype.getBy.mockResolvedValue(mockVariants);

      const result = await variantService.getBySubject(1);

      expect(result).toEqual(mockVariants);
    });

    it('should handle error when getting variants by subject', async() => {
      VariantRepository.prototype.getBy.mockRejectedValue(new Error('DB error'));

      const result = await variantService.getBySubject(1);

      expect(result).toEqual([]);
    });
  });
});