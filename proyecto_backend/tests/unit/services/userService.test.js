const UserService = require('../../../services/userService');
const UserRepository = require('../../../repositories/userRepository');
const bcrypt = require('bcryptjs');

jest.mock('../../../repositories/userRepository');
jest.mock('bcryptjs');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async() => {
      const userData = {
        username: 'test',
        password: 'password',
        email: 'test@test.com',
        born_date: '2000-01-01'
      };

      bcrypt.hash.mockResolvedValue('hashed-password');
      UserRepository.prototype.create.mockResolvedValue({ id: 1 });

      const result = await userService.register(userData);

      expect(result.ok).toBe(true);
      expect(result.user.idUsuario).toBe(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });

    it('should handle registration error', async() => {
      const userData = {
        username: 'test',
        password: 'password',
        email: 'test@test.com',
        born_date: '2000-01-01'
      };

      bcrypt.hash.mockResolvedValue('hashed-password');
      UserRepository.prototype.create.mockRejectedValue(new Error('DB error'));

      const result = await userService.register(userData);

      expect(result.ok).toBe(false);
      expect(result.msg).toBe('user-creation-failed');
    });
  });

  describe('getBy', () => {
    it('should return users', async() => {
      const mockUsers = [{ id: 1, username: 'test' }];
      UserRepository.prototype.getBy.mockResolvedValue(mockUsers);

      const result = await userService.getBy(['username'], ['test']);

      expect(result).toEqual(mockUsers);
    });

    it('should handle getBy error', async() => {
      UserRepository.prototype.getBy.mockRejectedValue(new Error('DB error'));

      const result = await userService.getBy(['username'], ['test']);

      expect(result).toEqual([]);
    });
  });

  describe('comparePassword', () => {
    it('should compare passwords correctly', async() => {
      bcrypt.compare.mockResolvedValue(true);

      const result = await userService.comparePassword('plain', 'hashed');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
    });

    it('should handle compare error', async() => {
      bcrypt.compare.mockRejectedValue(new Error('Comparison error'));

      const result = await userService.comparePassword('plain', 'hashed');

      expect(result).toBe(false);
    });
  });
});