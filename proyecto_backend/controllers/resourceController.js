const ResourceService = require('../services/resourceService');
const UserVariantService = require('../services/userVariantService');
const path = require('path');
const fs = require('fs').promises;

class ResourceController {
  constructor() {
    this.resourceService = new ResourceService();
    this.userVariantService = new UserVariantService();
    this.uploadDir = path.join(__dirname, '../public/uploads');
  }

  async create(req, res) {
    const userId = req.user ? req.user.idUsuario : null;
    if (!userId) {return res.status(401).json({ ok: false, msg: 'not-authenticated' });}

    const { idVariante } = req.query;
    const { tipo, titulo, descripcion } = req.body;
    if (!idVariante || !tipo || !titulo || !descripcion) {
      return res.json({ ok: false, msg: 'missing-fields' });
    }

    if (!req.file) {return res.json({ ok: false, msg: 'file-required' });}

    const isAdmin = await this.userVariantService.isAdminFromVariant(userId, idVariante);
    if (!isAdmin) {return res.json({ ok: false, msg: 'not-authorized' });}

    const ext = path.extname(req.file.originalname);
    const fileName = `r_${Date.now()}${ext}`;
    const relPath = `uploads/${fileName}`;

    const newResource = {
      idVariante,
      tipo,
      titulo,
      descripcion,
      file_path: relPath,
      creado_por: userId
    };

    const result = await this.resourceService.create(newResource);
    if (!result.ok) {return res.json({ ok: false, msg: result.msg });}

    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.writeFile(path.join(this.uploadDir, fileName), req.file.buffer);

    res.json({ ok: true, id: result.id });
  }

  async getByUserId(req, res) {
    const userId = req.user ? req.user.idUsuario : null;
    if (!userId) {return res.status(401).json({ ok: false, msg: 'not-authenticated' });}

    const queryUserId = req.query.userId ? parseInt(req.query.userId) : userId;
    if (queryUserId !== userId) {return res.json({ ok: false, msg: 'not-authorized' });}

    const resources = await this.resourceService.getBy(['creado_por'], [userId]);
    res.json({ ok: true, resources });
  }

  async delete(req, res) {
    const userId = req.user ? req.user.idUsuario : null;
    if (!userId) {return res.status(401).json({ ok: false, msg: 'not-authenticated' });}

    const { idRecurso } = req.query;
    if (!idRecurso) {return res.json({ ok: false, msg: 'missing-fields' });}

    const resources = await this.resourceService.getBy(['idRecurso'], [idRecurso]);
    if (!resources.length) {return res.json({ ok: false, msg: 'resource-not-found' });}

    const resource = resources[0];
    const isAdmin = await this.userVariantService.isAdminFromVariant(userId, resource.idVariante);
    if (!isAdmin) {return res.json({ ok: false, msg: 'not-authorized' });}

    const deleteRes = await this.resourceService.delete(idRecurso);
    if (!deleteRes.ok) {return res.json(deleteRes);}

    const absPath = path.join(__dirname, '../public', resource.file_path);
    if (await fs.access(absPath).then(() => true).catch(() => false)) {
      await fs.unlink(absPath);
    }

    res.json({ ok: true, msg: 'resource-deleted' });
  }

  async download(req, res) {
    const userId = req.user ? req.user.idUsuario : null;
    if (!userId) {
      console.error('Download failed: User not authenticated');
      return res.status(401).send('not-authenticated');
    }

    const { idRecurso } = req.query;
    if (!idRecurso) {
      console.error('Download failed: Missing idRecurso');
      return res.status(400).send('missing-fields');
    }

    const resources = await this.resourceService.getBy(['idRecurso'], [idRecurso]);
    if (!resources.length) {
      console.error(`Download failed: Resource not found for idRecurso=${idRecurso}`);
      return res.status(404).send('resource-not-found');
    }

    const resource = resources[0];
    const variantId = resource.idVariante;
    const isSub = await this.userVariantService.isSubFromVariant(userId, variantId);
    const isAdmin = await this.userVariantService.isAdminFromVariant(userId, variantId);
    if (!isSub && !isAdmin) {
      console.error(`Download failed: User ${userId} not authorized for variant ${variantId}`);
      return res.status(403).send('not-authorized');
    }

    const absPath = path.join(__dirname, '../public', resource.file_path);
    if (!await fs.access(absPath).then(() => true).catch(() => false)) {
      console.error(`Download failed: File missing at ${absPath}`);
      return res.status(410).send('file-missing');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(absPath)}"`);
    res.sendFile(absPath);
  }

  async getByVariant(req, res) {
    const userId = req.user ? req.user.idUsuario : null;
    if (!userId) {return res.status(401).json({ ok: false, msg: 'not-authenticated' });}

    const { idVariante } = req.query;
    if (!idVariante) {return res.json({ ok: false, msg: 'missing-fields' });}

    const isSub = await this.userVariantService.isSubFromVariant(userId, idVariante);
    const isAdmin = await this.userVariantService.isAdminFromVariant(userId, idVariante);
    if (!isSub && !isAdmin) {return res.json({ ok: false, msg: 'not-authorized' });}

    const resources = await this.resourceService.getByVariant(idVariante);
    res.json({ ok: true, resources });
  }
}

module.exports = ResourceController;