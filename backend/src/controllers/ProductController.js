const ProductService = require('../services/ProductService');

class ProductController {
  async listProducts(req, res, next) {
    try {
      const { category, search } = req.query;
      const filters = {};

      if (category) filters.category = category;
      if (search) filters.search = search;

      const products = await ProductService.listProducts(filters);

      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  async getProduct(req, res, next) {
    try {
      const product = await ProductService.getProduct(req.params.id);

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body);

      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      await ProductService.deleteProduct(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
