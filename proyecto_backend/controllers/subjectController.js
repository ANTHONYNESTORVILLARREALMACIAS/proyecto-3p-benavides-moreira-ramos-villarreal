const SubjectService = require('../services/subjectService');

class SubjectController {
  constructor() {
    this.subjectService = new SubjectService();
  }

  async getAll(req, res) {
    const userId = req.user ? req.user.idUsuario : null;
    if (!userId) {return res.status(401).json({ ok: false, msg: 'not-authenticated' });}

    const subjects = await this.subjectService.getAll();
    if (!subjects.length) {return res.json({ ok: false, msg: 'no-subjects-found' });}
    res.json({ ok: true, data: subjects });
  }
}

module.exports = SubjectController;