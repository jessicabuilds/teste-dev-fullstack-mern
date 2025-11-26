const express = require('express');
const { body } = require('express-validator');
const ProductController = require('../controllers/ProductController');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

const router = express.Router();

const productValidation = [
  (req, res, next) => {
    const data = req.body;
    
    if (!Array.isArray(data) && typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Request body must be an object or array of objects'
      });
    }

    if (Array.isArray(data) && data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array cannot be empty'
      });
    }

    const productsToValidate = Array.isArray(data) ? data : [data];
    const errors = [];

    productsToValidate.forEach((product, index) => {
      const productErrors = [];

      if (!product.name || typeof product.name !== 'string' || product.name.trim() === '') {
        productErrors.push({ field: 'name', message: 'Name is required' });
      }

      if (!product.description || typeof product.description !== 'string' || product.description.trim() === '') {
        productErrors.push({ field: 'description', message: 'Description is required' });
      }

      if (product.price === undefined || product.price === null || typeof product.price !== 'number' || product.price < 0) {
        productErrors.push({ field: 'price', message: 'Price must be a positive number' });
      }

      if (!product.category || typeof product.category !== 'string' || product.category.trim() === '') {
        productErrors.push({ field: 'category', message: 'Category is required' });
      }

      if (product.stock === undefined || product.stock === null || !Number.isInteger(product.stock) || product.stock < 0) {
        productErrors.push({ field: 'stock', message: 'Stock must be a non-negative integer' });
      }

      if (productErrors.length > 0) {
        errors.push({
          index: index,
          product: product,
          errors: productErrors
        });
      }
    });

    if (errors.length > 0) {
      if (Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          count: data.length,
          created: 0,
          failed: errors.length,
          errors: errors
        });
      }
      return res.status(400).json({
        success: false,
        errors: errors[0].errors
      });
    }

    next();
  }
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
