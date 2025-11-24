const mongoose = require('mongoose');
const ProductService = require('../../src/services/ProductService');
const Product = require('../../src/models/Product');

describe('ProductService', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  describe('listProducts', () => {
    beforeEach(async () => {
      await Product.create([
        {
          name: 'Laptop',
          description: 'Gaming laptop',
          price: 1500,
          category: 'Electronics',
          stock: 5,
          isActive: true
        },
        {
          name: 'Mouse',
          description: 'Wireless mouse',
          price: 25,
          category: 'Electronics',
          stock: 50,
          isActive: true
        },
        {
          name: 'Book',
          description: 'Programming book',
          price: 40,
          category: 'Books',
          stock: 20,
          isActive: true
        },
        {
          name: 'Inactive Product',
          description: 'Old product',
          price: 10,
          category: 'Electronics',
          stock: 0,
          isActive: false
        }
      ]);
    });

    it('should list all active products', async () => {
      const products = await ProductService.listProducts();

      expect(products.length).toBe(3);
      expect(products.every(p => p.isActive)).toBe(true);
    });

    it('should filter products by category', async () => {
      const products = await ProductService.listProducts({ category: 'Electronics' });

      expect(products.length).toBe(2);
      expect(products.every(p => p.category === 'Electronics')).toBe(true);
    });

    it('should search products by name', async () => {
      const products = await ProductService.listProducts({ search: 'laptop' });

      expect(products.length).toBe(1);
      expect(products[0].name).toBe('Laptop');
    });

    it('should return empty array when no products match', async () => {
      const products = await ProductService.listProducts({ category: 'NonExistent' });

      expect(products.length).toBe(0);
    });
  });

  describe('getProduct', () => {
    it('should get product by id', async () => {
      const created = await Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'Test',
        stock: 10
      });

      const product = await ProductService.getProduct(created._id);

      expect(product.name).toBe('Test Product');
      expect(product.price).toBe(99.99);
    });

    it('should throw error when product not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(ProductService.getProduct(fakeId)).rejects.toThrow('Product not found');
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Product',
        description: 'New description',
        price: 199.99,
        category: 'Electronics',
        stock: 15
      };

      const product = await ProductService.createProduct(productData);

      expect(product._id).toBeDefined();
      expect(product.name).toBe(productData.name);
      expect(product.price).toBe(productData.price);
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const created = await Product.create({
        name: 'Old Name',
        description: 'Old description',
        price: 50,
        category: 'Books',
        stock: 10
      });

      const updated = await ProductService.updateProduct(created._id, {
        name: 'New Name',
        price: 75
      });

      expect(updated.name).toBe('New Name');
      expect(updated.price).toBe(75);
      expect(updated.description).toBe('Old description');
    });

    it('should throw error when product not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        ProductService.updateProduct(fakeId, { name: 'Test' })
      ).rejects.toThrow('Product not found');
    });
  });

  describe('checkStock', () => {
    it('should return true when stock is sufficient', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test',
        price: 100,
        category: 'Test',
        stock: 10
      });

      const hasStock = await ProductService.checkStock(product._id, 5);

      expect(hasStock).toBe(true);
    });

    it('should return false when stock is insufficient', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test',
        price: 100,
        category: 'Test',
        stock: 3
      });

      const hasStock = await ProductService.checkStock(product._id, 5);

      expect(hasStock).toBe(false);
    });
  });

  describe('reserveStock', () => {
    it('should reserve stock successfully', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test',
        price: 100,
        category: 'Test',
        stock: 10
      });

      const updated = await ProductService.reserveStock(product._id, 3);

      expect(updated.stock).toBe(7);
    });

    it('should throw error when insufficient stock', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test',
        price: 100,
        category: 'Test',
        stock: 2
      });

      await expect(
        ProductService.reserveStock(product._id, 5)
      ).rejects.toThrow('Insufficient stock');
    });
  });

  describe('releaseStock', () => {
    it('should release stock successfully', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test',
        price: 100,
        category: 'Test',
        stock: 5
      });

      const updated = await ProductService.releaseStock(product._id, 3);

      expect(updated.stock).toBe(8);
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete product', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test',
        price: 100,
        category: 'Test',
        stock: 10
      });

      const deleted = await ProductService.deleteProduct(product._id);

      expect(deleted.isActive).toBe(false);
    });

    it('should throw error when product not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(ProductService.deleteProduct(fakeId)).rejects.toThrow('Product not found');
    });
  });
});
