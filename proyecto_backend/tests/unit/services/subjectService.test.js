const SubjectService = require('../../../services/subjectService');
const SubjectRepository = require('../../../repositories/subjectRepository');

jest.mock('../../../repositories/subjectRepository');

describe('SubjectService', () => {
  let subjectService;

  beforeEach(() => {
    subjectService = new SubjectService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all subjects', async() => {
      const mockSubjects = [{ idAsignatura: 1, nombre: 'Math' }];
      SubjectRepository.prototype.getAll.mockResolvedValue(mockSubjects);

      const result = await subjectService.getAll();

      expect(result).toEqual(mockSubjects);
    });

    it('should handle error when getting subjects', async() => {
      SubjectRepository.prototype.getAll.mockRejectedValue(new Error('DB error'));

      const result = await subjectService.getAll();

      expect(result).toEqual([]);
    });
  });
});