const ProductService = require('../services/ProductService');

class ProductController {
  async listProducts(req, res, next) {
    try {
      const { category, search, includeInactive } = req.query;
      const filters = {};

      if (category) filters.category = category;
      if (search) filters.search = search;

      if (includeInactive === 'true') {
        filters.includeInactive = true;
      }

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
      const result = await ProductService.createProduct(req.body);

      if (!result.success && !result.errors) {
        return res.status(201).json({
          success: true,
          data: result
        });
      }

      const totalCount = result.success.length + result.errors.length;
      const createdCount = result.success.length;
      const failedCount = result.errors.length;

      let statusCode;
      if (failedCount === 0) {
        statusCode = 201;
      } else if (createdCount === 0) {
        statusCode = 400;
      } else {
        statusCode = 207;
      }

      const response = {
        success: createdCount > 0,
        count: totalCount,
        created: createdCount,
        failed: failedCount,
        data: result.success
      };

      if (failedCount > 0) {
        response.errors = result.errors;
      }

      res.status(statusCode).json(response);
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

  async toggleActive(req, res, next) {
    try {
      const product = await ProductService.toggleActive(req.params.id);

      res.status(200).json({
        success: true,
        message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  async permanentDelete(req, res, next) {
    try {
      await ProductService.permanentDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Product permanently deleted'
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
