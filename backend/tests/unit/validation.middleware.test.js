const { body, validationResult } = require('express-validator');
const { validate } = require('../../src/middlewares/validation.middleware');

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
  body: jest.fn()
}));

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  it('should call next when validation passes', () => {
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });

    validate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 when validation fails', () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [
        { path: 'email', msg: 'Invalid email', value: 'invalid' },
        { path: 'password', msg: 'Password too short', value: '123' }
      ]
    });

    validate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: [
        { field: 'email', message: 'Invalid email', value: 'invalid' },
        { field: 'password', message: 'Password too short', value: '123' }
      ]
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle errors with param instead of path', () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [
        { param: 'name', msg: 'Name is required', value: '' }
      ]
    });

    validate(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: [
        { field: 'name', message: 'Name is required', value: '' }
      ]
    });
  });
});
