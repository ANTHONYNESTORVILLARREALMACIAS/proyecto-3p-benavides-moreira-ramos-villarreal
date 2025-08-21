const EvaluationController = require('../../../controllers/evaluationController');
const EvaluationService = require('../../../services/evaluationService');

jest.mock('../../../services/evaluationService');

describe('EvaluationController', () => {
  let evaluationController;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    evaluationController = new EvaluationController();
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

      await evaluationController.create(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authenticated' });
    });

    it('should return error when missing resource id', async() => {
      mockReq.body = { fecha_inicio: '2023-01-01', fecha_fin: '2023-01-02' };

      await evaluationController.create(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-resource-id' });
    });

    it('should create evaluation successfully', async() => {
      mockReq.body = { idRecurso: 1, fecha_inicio: '2023-01-01', fecha_fin: '2023-01-02', instrucciones: 'Test' };
      EvaluationService.prototype.create.mockResolvedValue({ ok: true, id: 1 });

      await evaluationController.create(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, id: 1 });
    });

    it('should handle evaluation creation failure', async() => {
      mockReq.body = { idRecurso: 1, fecha_inicio: '2023-01-01', fecha_fin: '2023-01-02', instrucciones: 'Test' };
      EvaluationService.prototype.create.mockResolvedValue({ ok: false, msg: 'creation-failed' });

      await evaluationController.create(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'creation-failed' });
    });
  });

  describe('getByResource', () => {
    it('should return error when not authenticated', async() => {
      mockReq.user = null;

      await evaluationController.getByResource(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authenticated' });
    });

    it('should return error when missing resource id', async() => {
      mockReq.query = {};

      await evaluationController.getByResource(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-resource-id' });
    });

    it('should return evaluations for resource', async() => {
      mockReq.query = { idRecurso: 1 };
      const mockEvaluations = [{ idEvaluacion: 1, idRecurso: 1 }];
      EvaluationService.prototype.getByResource.mockResolvedValue(mockEvaluations);

      await evaluationController.getByResource(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, data: mockEvaluations });
    });

    it('should return error when no evaluations found', async() => {
      mockReq.query = { idRecurso: 1 };
      EvaluationService.prototype.getByResource.mockResolvedValue([]);

      await evaluationController.getByResource(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'evaluations-not-found' });
    });
  });

  describe('update', () => {
    it('should return error when not authenticated', async() => {
      mockReq.user = null;

      await evaluationController.update(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authenticated' });
    });

    it('should return error when missing evaluation id', async() => {
      mockReq.body = { fecha_inicio: '2023-01-01', fecha_fin: '2023-01-02' };

      await evaluationController.update(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-evaluation-id' });
    });

    it('should update evaluation successfully', async() => {
      mockReq.body = { idEvaluacion: 1, fecha_inicio: '2023-01-01', fecha_fin: '2023-01-02', instrucciones: 'Updated' };
      EvaluationService.prototype.update.mockResolvedValue({ ok: true, msg: 'evaluation-updated' });

      await evaluationController.update(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, msg: 'evaluation-updated' });
    });

    it('should handle evaluation update failure', async() => {
      mockReq.body = { idEvaluacion: 1, fecha_inicio: '2023-01-01', fecha_fin: '2023-01-02', instrucciones: 'Updated' };
      EvaluationService.prototype.update.mockResolvedValue({ ok: false, msg: 'update-failed' });

      await evaluationController.update(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'update-failed' });
    });
  });
});