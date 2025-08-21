const { isAuthenticated } = require('../../../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token provided', () => {
    isAuthenticated(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'not-authenticated' });
  });

  it('should return 401 if invalid token', () => {
    mockReq.headers.authorization = 'Bearer invalid-token';
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    isAuthenticated(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ ok: false, msg: 'invalid-token' });
  });

  it('should call next if valid token', () => {
    mockReq.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ idUsuario: 1, username: 'test' });

    isAuthenticated(mockReq, mockRes, mockNext);

    expect(mockReq.user).toEqual({ idUsuario: 1, username: 'test' });
    expect(mockNext).toHaveBeenCalled();
  });
});