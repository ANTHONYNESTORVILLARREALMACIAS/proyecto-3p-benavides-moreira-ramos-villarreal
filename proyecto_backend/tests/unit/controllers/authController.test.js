const AuthController = require('../../../controllers/authController');
const UserService = require('../../../services/userService');
const jwt = require('jsonwebtoken');

jest.mock('../../../services/userService');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
  let authController;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    authController = new AuthController();
    mockReq = {
      body: {},
      user: null
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return error when missing fields', async() => {
      mockReq.body = { username: 'test' };
      await authController.register(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-fields' });
    });

    it('should return error when username is taken', async() => {
      mockReq.body = { username: 'test', password: 'pass', email: 'test@test.com', bornDate: '2000-01-01' };
      authController.userService.getBy.mockResolvedValue([{ username: 'test' }]);
      await authController.register(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'username-taken' });
    });

    it('should register user successfully', async() => {
      mockReq.body = { username: 'test', password: 'pass', email: 'test@test.com', bornDate: '2000-01-01' };
      authController.userService.getBy.mockResolvedValue([]);
      authController.userService.register.mockResolvedValue({
        ok: true,
        user: { idUsuario: 1, username: 'test' }
      });
      jwt.sign.mockReturnValue('mock-token');
      await authController.register(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: true,
        user: { idUsuario: 1, username: 'test' },
        token: 'mock-token'
      });
    });

    it('should handle registration failure', async() => {
      mockReq.body = { username: 'test', password: 'pass', email: 'test@test.com', bornDate: '2000-01-01' };
      authController.userService.getBy.mockResolvedValue([]);
      authController.userService.register.mockResolvedValue({
        ok: false,
        msg: 'registration-failed'
      });
      await authController.register(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'registration-failed' });
    });
  });

  describe('login', () => {
    it('should return error when missing fields', async() => {
      mockReq.body = { username: 'test' };
      await authController.login(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'missing-fields' });
    });

    it('should return error when user not found', async() => {
      mockReq.body = { username: 'test', password: 'wrong' };
      authController.userService.getBy.mockResolvedValue([]);
      await authController.login(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'invalid-credentials' });
    });

    it('should return error when password is incorrect', async() => {
      mockReq.body = { username: 'test', password: 'wrong' };
      authController.userService.getBy.mockResolvedValue([{
        idUsuario: 1,
        username: 'test',
        password: 'hashed-pass'
      }]);
      authController.userService.comparePassword.mockResolvedValue(false);
      await authController.login(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'invalid-credentials' });
    });

    it('should login user successfully', async() => {
      mockReq.body = { username: 'test', password: 'correct' };
      authController.userService.getBy.mockResolvedValue([{
        idUsuario: 1,
        username: 'test',
        password: 'hashed-pass'
      }]);
      authController.userService.comparePassword.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');
      await authController.login(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: true,
        user: { idUsuario: 1, username: 'test' },
        token: 'mock-token'
      });
    });
  });

  describe('check', () => {
    it('should return not authenticated when no user', async() => {
      await authController.check(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authenticated' });
    });

    it('should return user info when authenticated', async() => {
      mockReq.user = { username: 'test' };
      await authController.check(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, username: 'test' });
    });
  });

  describe('logout', () => {
    it('should return logout success', async() => {
      await authController.logout(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ ok: true, msg: 'logout-successful' });
    });
  });
});