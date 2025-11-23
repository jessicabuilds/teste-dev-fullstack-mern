const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      error: 'Validation failed',
      details: formattedErrors
    });
  }

  next();
};

module.exports = { validate };
