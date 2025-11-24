const express = require('express');
const { body } = require('express-validator');
const ProductController = require('../controllers/ProductController');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

const router = express.Router();

const productValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  validate
];

const updateProductValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  validate
];

router.get('/', ProductController.listProducts);
router.get('/:id', ProductController.getProduct);
router.post('/', authenticate, authorize('admin'), productValidation, ProductController.createProduct);
router.put('/:id', authenticate, authorize('admin'), updateProductValidation, ProductController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), ProductController.deleteProduct);

module.exports = router;
