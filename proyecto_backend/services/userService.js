const UserRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(user) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = {
        username: user.username,
        password: hashedPassword,
        email: user.email,
        born_date: user.born_date
      };
      const result = await this.userRepository.create(newUser);
      return { ok: true, user: { idUsuario: result.id, username: user.username, email: user.email } };
    } catch (error) {
      console.error(`UserService register error: ${error.message}`);
      return { ok: false, msg: 'user-creation-failed', error: error.message };
    }
  }

  async getBy(fields, values) {
    try {
      const users = await this.userRepository.getBy(fields, values);
      return users;
    } catch (error) {
      console.error(`UserService getBy error: ${error.message}`);
      return [];
    }
  }

  async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error(`UserService comparePassword error: ${error.message}`);
      return false;
    }
  }
}

module.exports = UserService;