const Product = require('../models/Product');
const { NotFoundError, ValidationError } = require('../utils/errors');

class ProductService {
  async listProducts(filters = {}) {
    const query = { isActive: true };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return products;
  }

  async getProduct(productId) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async createProduct(productData) {
    const product = new Product(productData);
    await product.save();
    return product;
  }

  async updateProduct(productId, updateData) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    Object.assign(product, updateData);
    await product.save();

    return product;
  }

  async checkStock(productId, quantity) {
    const product = await this.getProduct(productId);

    if (product.stock < quantity) {
      return false;
    }

    return true;
  }

  async reserveStock(productId, quantity) {
    const product = await this.getProduct(productId);

    if (product.stock < quantity) {
      throw new ValidationError('Insufficient stock');
    }

    product.stock -= quantity;
    await product.save();

    return product;
  }

  async releaseStock(productId, quantity) {
    const product = await this.getProduct(productId);

    product.stock += quantity;
    await product.save();

    return product;
  }

  async deleteProduct(productId) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    product.isActive = false;
    await product.save();

    return product;
  }
}

module.exports = new ProductService();
