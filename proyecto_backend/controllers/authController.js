const UserService = require('../services/userService');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthController {
  constructor() {
    this.userService = new UserService();
  }

  async register(req, res) {
    const { username, password, email, bornDate } = req.body;
    if (!username || !password || !email || !bornDate) {
      return res.json({ ok: false, msg: 'missing-fields' });
    }

    const existingUser = await this.userService.getBy(['username'], [username]);
    if (existingUser.length > 0) {
      return res.json({ ok: false, msg: 'username-taken' });
    }

    const result = await this.userService.register({ username, password, email, born_date: bornDate });
    if (!result.ok) return res.json(result);

    const token = jwt.sign(
      { idUsuario: result.user.idUsuario, username },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({ ok: true, user: result.user, token });
  }

  async login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({ ok: false, msg: 'missing-fields' });
    }

    const user = await this.userService.getBy(['username'], [username]);
    if (!user.length) {
      return res.json({ ok: false, msg: 'invalid-credentials' });
    }

    const isMatch = await this.userService.comparePassword(password, user[0].password);
    if (!isMatch) {
      return res.json({ ok: false, msg: 'invalid-credentials' });
    }

    const token = jwt.sign(
      { idUsuario: user[0].idUsuario, username },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({ ok: true, user: { idUsuario: user[0].idUsuario, username }, token });
  }

  async check(req, res) {
    if (!req.user) {
      return res.json({ ok: false, msg: 'not-authenticated' });
    }
    res.json({ ok: true, username: req.user.username });
  }

  async logout(req, res) {
    // No action needed for JWT; client should discard token
    res.json({ ok: true, msg: 'logout-successful' });
  }
}

module.exports = AuthController;