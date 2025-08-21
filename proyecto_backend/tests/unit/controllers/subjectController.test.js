const SubjectController = require('../../../controllers/subjectController');
const SubjectService = require('../../../services/subjectService');

jest.mock('../../../services/subjectService');

describe('SubjectController', () => {
  let subjectController;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    subjectController = new SubjectController();
    mockReq = {
      user: { idUsuario: 1 }
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
      await subjectController.getAll(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authenticated' });
    });

    it('should return error when no subjects found', async() => {
      SubjectService.prototype.getAll.mockResolvedValue([]);
      await subjectController.getAll(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'no-subjects-found' });
    });

    it('should return subjects successfully', async() => {
      const mockSubjects = [{ idAsignatura: 1, nombre: 'Math' }];
      SubjectService.prototype.getAll.mockResolvedValue(mockSubjects);
      await subjectController.getAll(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, data: mockSubjects });
    });
  });
});