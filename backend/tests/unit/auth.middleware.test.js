const jwt = require('jsonwebtoken');
const { authenticate, authorize, checkOwnership } = require('../../src/middlewares/auth.middleware');
const jwtConfig = require('../../src/config/jwt');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate valid token', () => {
      const user = { id: '123', email: 'test@example.com', role: 'user' };
      const token = jwt.sign(user, jwtConfig.secret, { expiresIn: '15m' });

      req.headers.authorization = `Bearer ${token}`;

      authenticate(req, res, next);

      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should authenticate token without Bearer prefix', () => {
      const user = { id: '123', email: 'test@example.com', role: 'user' };
      const token = jwt.sign(user, jwtConfig.secret, { expiresIn: '15m' });

      req.headers.authorization = token;

      authenticate(req, res, next);

      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });

    it('should reject request without authorization header', () => {
      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject expired token', (done) => {
      const user = { id: '123', email: 'test@example.com', role: 'user' };
      const token = jwt.sign(user, jwtConfig.secret, { expiresIn: '0s' });

      setTimeout(() => {
        req.headers.authorization = `Bearer ${token}`;
        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' });
        expect(next).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('authorize', () => {
    beforeEach(() => {
      req.user = { id: '123', email: 'test@example.com', role: 'user' };
    });

    it('should allow access when no roles specified', () => {
      const middleware = authorize();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow access when user has required role', () => {
      const middleware = authorize('user', 'admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access when user lacks required role', () => {
      req.user.role = 'user';
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when user is not authenticated', () => {
      req.user = null;
      const middleware = authorize('user');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('checkOwnership', () => {
    beforeEach(() => {
      req.user = { id: '123', email: 'test@example.com', role: 'user' };
    });

    it('should allow access when user owns the resource', () => {
      const getUserId = (req) => req.params.userId;
      req.params = { userId: '123' };

      const middleware = checkOwnership(getUserId);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access when user does not own the resource', () => {
      const getUserId = (req) => req.params.userId;
      req.params = { userId: '456' };

      const middleware = checkOwnership(getUserId);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow admin access to any resource', () => {
      req.user.role = 'admin';
      const getUserId = (req) => req.params.userId;
      req.params = { userId: '456' };

      const middleware = checkOwnership(getUserId);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access when user is not authenticated', () => {
      req.user = null;
      const getUserId = (req) => req.params.userId;
      req.params = { userId: '123' };

      const middleware = checkOwnership(getUserId);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow access when resourceUserId is null', () => {
      const getUserId = (req) => null;

      const middleware = checkOwnership(getUserId);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
