const express = require('express');
const { body, param } = require('express-validator');
const CartController = require('../controllers/CartController');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

const router = express.Router();

const addItemValidation = [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
];

const updateItemValidation = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
];

const removeItemValidation = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  validate
];

router.get('/', authenticate, CartController.getCart);
router.post('/items', authenticate, addItemValidation, CartController.addItem);
router.put('/items/:productId', authenticate, updateItemValidation, CartController.updateItem);
router.delete('/items/:productId', authenticate, removeItemValidation, CartController.removeItem);
router.delete('/', authenticate, CartController.clearCart);

module.exports = router;
