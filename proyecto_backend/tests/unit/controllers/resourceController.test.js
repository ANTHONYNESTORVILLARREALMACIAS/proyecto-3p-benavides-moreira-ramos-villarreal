const ResourceController = require('../../../controllers/resourceController');
const ResourceService = require('../../../services/resourceService');
const UserVariantService = require('../../../services/userVariantService');

// Mock correcto de fs
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn(),
    unlink: jest.fn()
  }
}));

jest.mock('../../../services/resourceService');
jest.mock('../../../services/userVariantService');
jest.mock('path');

describe('ResourceController', () => {
  let resourceController;
  let mockReq;
  let mockRes;
  let fs;

  beforeEach(() => {
    resourceController = new ResourceController();
    mockReq = {
      user: { idUsuario: 1 },
      query: {},
      body: {},
      file: null
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      sendFile: jest.fn(),
      send: jest.fn()
    };

    // Importar fs después del mock
    fs = require('fs').promises;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return error when not authenticated', async() => {
      // En lugar de null, usar un objeto sin user o user sin idUsuario
      mockReq.user = null;

      await resourceController.create(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authenticated' });
    });

    it('should return error when missing fields', async() => {
      mockReq.query = { idVariante: '1' };
      mockReq.body = { tipo: 'pdf' };

      await resourceController.create(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-fields' });
    });

    it('should return error when no file', async() => {
      mockReq.query = { idVariante: '1' };
      mockReq.body = { tipo: 'pdf', titulo: 'Test', descripcion: 'Test desc' };

      await resourceController.create(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'file-required' });
    });

    it('should return error when not authorized', async() => {
      mockReq.query = { idVariante: '1' };
      mockReq.body = { tipo: 'pdf', titulo: 'Test', descripcion: 'Test desc' };
      mockReq.file = { originalname: 'test.pdf', buffer: Buffer.from('test') };
      UserVariantService.prototype.isAdminFromVariant.mockResolvedValue(false);

      await resourceController.create(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authorized' });
    });

    it('should create resource successfully', async() => {
      mockReq.query = { idVariante: '1' };
      mockReq.body = { tipo: 'pdf', titulo: 'Test', descripcion: 'Test desc' };
      mockReq.file = { originalname: 'test.pdf', buffer: Buffer.from('test') };
      UserVariantService.prototype.isAdminFromVariant.mockResolvedValue(true);
      ResourceService.prototype.create.mockResolvedValue({ ok: true, id: 1 });
      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await resourceController.create(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, id: 1 });
    });

    it('should handle resource creation failure', async() => {
      mockReq.query = { idVariante: '1' };
      mockReq.body = { tipo: 'pdf', titulo: 'Test', descripcion: 'Test desc' };
      mockReq.file = { originalname: 'test.pdf', buffer: Buffer.from('test') };
      UserVariantService.prototype.isAdminFromVariant.mockResolvedValue(true);
      ResourceService.prototype.create.mockResolvedValue({ ok: false, msg: 'creation-failed' });

      await resourceController.create(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'creation-failed' });
    });
  });

  describe('getByUserId', () => {
    it('should return error when not authenticated', async() => {
      mockReq.user = null;

      await resourceController.getByUserId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authenticated' });
    });

    it('should return error when unauthorized user access', async() => {
      mockReq.query = { userId: 999 };

      await resourceController.getByUserId(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authorized' });
    });

    it('should return resources for user', async() => {
      ResourceService.prototype.getBy.mockResolvedValue([{ id: 1, titulo: 'Test' }]);

      await resourceController.getByUserId(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, resources: [{ id: 1, titulo: 'Test' }] });
    });
  });

  describe('delete', () => {
    it('should return error when missing resource id', async() => {
      mockReq.query = {};

      await resourceController.delete(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-fields' });
    });

    it('should return error when resource not found', async() => {
      mockReq.query = { idRecurso: 999 };
      ResourceService.prototype.getBy.mockResolvedValue([]);

      await resourceController.delete(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'resource-not-found' });
    });

    it('should return error when not authorized to delete', async() => {
      mockReq.query = { idRecurso: 1 };
      ResourceService.prototype.getBy.mockResolvedValue([{ idRecurso: 1, idVariante: 1 }]);
      UserVariantService.prototype.isAdminFromVariant.mockResolvedValue(false);

      await resourceController.delete(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authorized' });
    });

    it('should delete resource successfully', async() => {
      mockReq.query = { idRecurso: 1 };
      ResourceService.prototype.getBy.mockResolvedValue([{ idRecurso: 1, idVariante: 1, file_path: 'uploads/test.pdf' }]);
      UserVariantService.prototype.isAdminFromVariant.mockResolvedValue(true);
      ResourceService.prototype.delete.mockResolvedValue({ ok: true, msg: 'resource-deleted' });
      fs.access.mockResolvedValue();
      fs.unlink.mockResolvedValue();

      await resourceController.delete(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, msg: 'resource-deleted' });
    });

    it('should handle file not found during deletion', async() => {
      mockReq.query = { idRecurso: 1 };
      ResourceService.prototype.getBy.mockResolvedValue([{ idRecurso: 1, idVariante: 1, file_path: 'uploads/test.pdf' }]);
      UserVariantService.prototype.isAdminFromVariant.mockResolvedValue(true);
      ResourceService.prototype.delete.mockResolvedValue({ ok: true, msg: 'resource-deleted' });
      fs.access.mockRejectedValue(new Error('File not found'));

      await resourceController.delete(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, msg: 'resource-deleted' });
    });
  });

  describe('download', () => {
    it('should return error when not authenticated', async() => {
      mockReq.user = null;

      await resourceController.download(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith('not-authenticated');
    });

    it('should return error when missing resource id', async() => {
      mockReq.query = {};

      await resourceController.download(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('missing-fields');
    });

    it('should return error when resource not found', async() => {
      mockReq.query = { idRecurso: 999 };
      ResourceService.prototype.getBy.mockResolvedValue([]);

      await resourceController.download(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith('resource-not-found');
    });

    it('should return error when not authorized to download', async() => {
      mockReq.query = { idRecurso: 1 };
      ResourceService.prototype.getBy.mockResolvedValue([{ idRecurso: 1, idVariante: 1 }]);
      UserVariantService.prototype.isSubFromVariant.mockResolvedValue(false);
      UserVariantService.prototype.isAdminFromVariant.mockResolvedValue(false);

      await resourceController.download(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.send).toHaveBeenCalledWith('not-authorized');
    });

    it('should return error when file missing', async() => {
      mockReq.query = { idRecurso: 1 };
      ResourceService.prototype.getBy.mockResolvedValue([{ idRecurso: 1, idVariante: 1, file_path: 'uploads/test.pdf' }]);
      UserVariantService.prototype.isSubFromVariant.mockResolvedValue(true);
      fs.access.mockRejectedValue(new Error('File not found'));

      await resourceController.download(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(410);
      expect(mockRes.send).toHaveBeenCalledWith('file-missing');
    });

    it('should download file successfully', async() => {
      mockReq.query = { idRecurso: 1 };
      ResourceService.prototype.getBy.mockResolvedValue([{ idRecurso: 1, idVariante: 1, file_path: 'uploads/test.pdf' }]);
      UserVariantService.prototype.isSubFromVariant.mockResolvedValue(true);
      fs.access.mockResolvedValue();

      const path = require('path');
      path.join.mockReturnValue('/absolute/path/to/file');
      path.basename.mockReturnValue('test.pdf');

      await resourceController.download(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'inline; filename="test.pdf"');
      expect(mockRes.sendFile).toHaveBeenCalledWith('/absolute/path/to/file');
    });
  });

  describe('getByVariant', () => {
    it('should return error when not authenticated', async() => {
      mockReq.user = null;

      await resourceController.getByVariant(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authenticated' });
    });

    it('should return error when missing variant id', async() => {
      mockReq.query = {};

      await resourceController.getByVariant(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-fields' });
    });

    it('should return error when not authorized', async() => {
      mockReq.query = { idVariante: 1 };
      UserVariantService.prototype.isSubFromVariant.mockResolvedValue(false);
      UserVariantService.prototype.isAdminFromVariant.mockResolvedValue(false);

      await resourceController.getByVariant(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authorized' });
    });

    it('should return resources for variant', async() => {
      mockReq.query = { idVariante: 1 };
      UserVariantService.prototype.isSubFromVariant.mockResolvedValue(true);
      ResourceService.prototype.getByVariant.mockResolvedValue([{ id: 1, titulo: 'Test' }]);

      await resourceController.getByVariant(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, resources: [{ id: 1, titulo: 'Test' }] });
    });
  });
});