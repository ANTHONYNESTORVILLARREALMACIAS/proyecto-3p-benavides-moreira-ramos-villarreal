const VariantController = require('../../../controllers/variantController');
const VariantService = require('../../../services/variantService');

jest.mock('../../../services/variantService');

describe('VariantController', () => {
  let variantController;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    variantController = new VariantController();
    mockReq = {
      user: { idUsuario: 1 },
      query: {}
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return error when not authenticated', async() => {
      mockReq.user = null;
      await variantController.getAll(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authenticated' });
    });

    it('should return error when no variants found', async() => {
      VariantService.prototype.getAll.mockResolvedValue([]);
      await variantController.getAll(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'no-variants-found' });
    });

    it('should return variants successfully', async() => {
      const mockVariants = [{ idVariante: 1, nombre: 'Variant 1' }];
      VariantService.prototype.getAll.mockResolvedValue(mockVariants);
      await variantController.getAll(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, data: mockVariants });
    });
  });

  describe('getBySubject', () => {
    it('should return error when missing subject id', async() => {
      mockReq.query = {};
      await variantController.getBySubject(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-fields' });
    });

    it('should return variants by subject', async() => {
      mockReq.query = { idAsignatura: 1 };
      const mockVariants = [{ idVariante: 1, idAsignatura: 1 }];
      VariantService.prototype.getBySubject.mockResolvedValue(mockVariants);
      await variantController.getBySubject(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, data: mockVariants });
    });
  });
});