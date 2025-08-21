const UserRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(username, password) {
    try {
      // Usar getBy en lugar de findByUsername
      const users = await this.userRepository.getBy(['username'], [username]);
      if (!users.length) {return { ok: false, msg: 'invalid-credentials' };}

      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {return { ok: false, msg: 'invalid-credentials' };}

      return { ok: true, user: { idUsuario: user.idUsuario, username: user.username } };
    } catch (error) {
      console.error(`AuthService login error: ${error.message}`);
      return { ok: false, msg: 'login-failed' };
    }
  }

  async register(userData) {
    try {
      // Verificar si el usuario ya existe
      const existingUsers = await this.userRepository.getBy(['username'], [userData.username]);
      if (existingUsers.length) {return { ok: false, msg: 'username-taken' };}

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = {
        username: userData.username,
        password: hashedPassword,
        email: userData.email,
        born_date: userData.born_date
      };

      const result = await this.userRepository.create(newUser);
      return {
        ok: true,
        user: {
          idUsuario: result.id,
          username: userData.username,
          email: userData.email
        }
      };
    } catch (error) {
      console.error(`AuthService register error: ${error.message}`);
      return { ok: false, msg: 'registration-failed' };
    }
  }
}

module.exports = AuthService;