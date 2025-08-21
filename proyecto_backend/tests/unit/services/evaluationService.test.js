const EvaluationService = require('../../../services/evaluationService');
const EvaluationRepository = require('../../../repositories/evaluationRepository');

jest.mock('../../../repositories/evaluationRepository');

describe('EvaluationService', () => {
  let evaluationService;

  beforeEach(() => {
    evaluationService = new EvaluationService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create evaluation successfully', async() => {
      const evaluationData = {
        idRecurso: 1,
        fecha_inicio: '2023-01-01',
        fecha_fin: '2023-01-02',
        instrucciones: 'Test instructions'
      };

      EvaluationRepository.prototype.create.mockResolvedValue({ id: 1 });

      const result = await evaluationService.create(evaluationData);

      expect(result.ok).toBe(true);
      expect(result.id).toBe(1);
    });

    it('should handle creation error', async() => {
      const evaluationData = {
        idRecurso: 1,
        fecha_inicio: '2023-01-01',
        fecha_fin: '2023-01-02',
        instrucciones: 'Test instructions'
      };

      EvaluationRepository.prototype.create.mockRejectedValue(new Error('DB error'));

      const result = await evaluationService.create(evaluationData);

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('evaluation-creation-failed');
    });
  });

  describe('getBy', () => {
    it('should return evaluations', async() => {
      const mockEvaluations = [{ idEvaluacion: 1, idRecurso: 1 }];
      EvaluationRepository.prototype.getBy.mockResolvedValue(mockEvaluations);

      const result = await evaluationService.getBy(['idRecurso'], [1]);

      expect(result).toEqual(mockEvaluations);
    });

    it('should handle getBy error', async() => {
      EvaluationRepository.prototype.getBy.mockRejectedValue(new Error('DB error'));

      const result = await evaluationService.getBy(['idRecurso'], [1]);

      expect(result).toEqual([]);
    });
  });

  describe('getByResource', () => {
    it('should return evaluations for resource', async() => {
      const mockEvaluations = [{ idEvaluacion: 1, idRecurso: 1 }];
      EvaluationRepository.prototype.getBy.mockResolvedValue(mockEvaluations);

      const result = await evaluationService.getByResource(1);

      expect(result).toEqual(mockEvaluations);
    });

    it('should handle error when getting evaluations', async() => {
      EvaluationRepository.prototype.getBy.mockRejectedValue(new Error('DB error'));

      const result = await evaluationService.getByResource(1);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update evaluation successfully', async() => {
      const evaluationData = {
        idEvaluacion: 1,
        fecha_inicio: '2023-01-01',
        fecha_fin: '2023-01-02',
        instrucciones: 'Updated instructions'
      };

      EvaluationRepository.prototype.pool = {
        query: jest.fn().mockResolvedValue([{ affectedRows: 1 }])
      };

      const result = await evaluationService.update(evaluationData);

      expect(result.ok).toBe(true);
      expect(result.msg).toBe('evaluation-updated');
    });

    it('should return error when evaluation not found', async() => {
      const evaluationData = {
        idEvaluacion: 999,
        fecha_inicio: '2023-01-01',
        fecha_fin: '2023-01-02',
        instrucciones: 'Updated instructions'
      };

      EvaluationRepository.prototype.pool = {
        query: jest.fn().mockResolvedValue([{ affectedRows: 0 }])
      };

      const result = await evaluationService.update(evaluationData);

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('evaluation-not-found');
    });

    it('should handle update error', async() => {
      const evaluationData = {
        idEvaluacion: 1,
        fecha_inicio: '2023-01-01',
        fecha_fin: '2023-01-02',
        instrucciones: 'Updated instructions'
      };

      EvaluationRepository.prototype.pool = {
        query: jest.fn().mockRejectedValue(new Error('DB error'))
      };

      const result = await evaluationService.update(evaluationData);

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('evaluation-update-failed');
    });
  });
});