const UserRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(username, password) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) return { ok: false, msg: 'invalid-credentials' };
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { ok: false, msg: 'invalid-credentials' };
    return { ok: true, user: { idUsuario: user.idUsuario, username: user.username } };
  }

  async register(user) {
    try {
      const existingUser = await this.userRepository.findByUsername(user.username);
      if (existingUser) return { ok: false, msg: 'username-taken' };
      const newUser = await this.userRepository.create(user);
      return { ok: true, user: newUser };
    } catch (error) {
      return { ok: false, msg: 'registration-failed' };
    }
  }
}

module.exports = AuthService;