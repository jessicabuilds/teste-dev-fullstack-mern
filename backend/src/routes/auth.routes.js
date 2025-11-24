const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const { validate } = require('../middlewares/validation.middleware');

const router = express.Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const refreshValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validate
];

const logoutValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validate
];

router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/refresh', refreshValidation, AuthController.refresh);
router.post('/logout', logoutValidation, AuthController.logout);

module.exports = router;
