const AuthService = require('../../../services/authService');
const UserRepository = require('../../../repositories/userRepository');
const bcrypt = require('bcryptjs');

jest.mock('../../../repositories/userRepository');
jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return error when user not found', async() => {
      UserRepository.prototype.getBy.mockResolvedValue([]);

      const result = await authService.login('test', 'password');

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('invalid-credentials');
    });

    it('should return error when password is incorrect', async() => {
      UserRepository.prototype.getBy.mockResolvedValue([{
        idUsuario: 1,
        username: 'test',
        password: 'hashed-password'
      }]);
      bcrypt.compare.mockResolvedValue(false);

      const result = await authService.login('test', 'wrong-password');

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('invalid-credentials');
    });

    it('should login successfully', async() => {
      UserRepository.prototype.getBy.mockResolvedValue([{
        idUsuario: 1,
        username: 'test',
        password: 'hashed-password'
      }]);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login('test', 'correct-password');

      expect(result.ok).toBe(true);
      expect(result.user.idUsuario).toBe(1);
      expect(result.user.username).toBe('test');
    });

    it('should handle login error', async() => {
      UserRepository.prototype.getBy.mockRejectedValue(new Error('DB error'));

      const result = await authService.login('test', 'password');

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('login-failed');
    });
  });

  describe('register', () => {
    it('should return error when username is taken', async() => {
      UserRepository.prototype.getBy.mockResolvedValue([{ username: 'test' }]);

      const result = await authService.register({
        username: 'test',
        password: 'password',
        email: 'test@test.com',
        born_date: '2000-01-01'
      });

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('username-taken');
    });

    it('should register user successfully', async() => {
      UserRepository.prototype.getBy.mockResolvedValue([]);
      bcrypt.hash.mockResolvedValue('hashed-password');
      UserRepository.prototype.create.mockResolvedValue({ id: 1 });

      const result = await authService.register({
        username: 'test',
        password: 'password',
        email: 'test@test.com',
        born_date: '2000-01-01'
      });

      expect(result.ok).toBe(true);
      expect(result.user.idUsuario).toBe(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });

    it('should handle registration error', async() => {
      UserRepository.prototype.getBy.mockResolvedValue([]);
      bcrypt.hash.mockResolvedValue('hashed-password');
      UserRepository.prototype.create.mockRejectedValue(new Error('DB error'));

      const result = await authService.register({
        username: 'test',
        password: 'password',
        email: 'test@test.com',
        born_date: '2000-01-01'
      });

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('registration-failed');
    });
  });
});