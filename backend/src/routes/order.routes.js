const express = require('express');
const { body, param } = require('express-validator');
const OrderController = require('../controllers/OrderController');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

const router = express.Router();

const checkoutValidation = [
  body('shippingAddress.street').trim().notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
  body('paymentMethod').trim().notEmpty().withMessage('Payment method is required'),
  validate
];

const orderIdValidation = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  validate
];

router.post('/checkout', authenticate, checkoutValidation, OrderController.checkout);
router.get('/admin/all', authenticate, OrderController.getAllOrders);
router.get('/', authenticate, OrderController.getUserOrders);
router.get('/:id', authenticate, orderIdValidation, OrderController.getOrder);
router.post('/:id/cancel', authenticate, orderIdValidation, OrderController.cancelOrder);

module.exports = router;
