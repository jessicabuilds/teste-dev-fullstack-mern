const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/UserController');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

const router = express.Router();

const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  validate
];

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, updateProfileValidation, UserController.updateProfile);

module.exports = router;
