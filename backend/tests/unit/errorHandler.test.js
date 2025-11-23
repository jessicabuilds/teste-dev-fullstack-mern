const { errorHandler, notFound } = require('../../src/middlewares/errorHandler.middleware');
const { AppError, ValidationError } = require('../../src/utils/errors');
const logger = require('../../src/config/logger');

jest.mock('../../src/config/logger');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      originalUrl: '/test',
      method: 'GET',
      ip: '127.0.0.1'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    logger.error = jest.fn();
    logger.warn = jest.fn();
    process.env.NODE_ENV = 'test';
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError('Test error', 400);

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Test error'
      });
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should handle ValidationError with details', () => {
      const error = new ValidationError('Validation failed', ['Field is required']);
      error.statusCode = 400;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed'
        })
      );
    });

    it('should handle CastError as 404', () => {
      const error = new Error('Cast failed');
      error.name = 'CastError';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Resource not found'
      });
    });

    it('should handle duplicate key error (11000)', () => {
      const error = new Error('Duplicate key');
      error.code = 11000;
      error.keyValue = { email: 'test@example.com' };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'email already exists'
      });
    });

    it('should handle mongoose ValidationError', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        name: { message: 'Name is required' },
        email: { message: 'Email is invalid' }
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Name is required', 'Email is invalid']
      });
    });

    it('should handle unknown errors as 500', () => {
      const error = new Error('Unknown error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unknown error'
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should log errors with status >= 500', () => {
      const error = new AppError('Server error', 500);

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalled();
    });

    it('should log warnings for client errors', () => {
      const error = new AppError('Client error', 400);

      errorHandler(error, req, res, next);

      expect(logger.warn).toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Test error');

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String)
        })
      );
    });
  });

  describe('notFound', () => {
    it('should create 404 error and call next', () => {
      notFound(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Route not found - /test',
          statusCode: 404
        })
      );
    });
  });
});
