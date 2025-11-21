const mongoose = require('mongoose');
const Product = require('../../src/models/Product');

describe('Product Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  describe('Validation', () => {
    it('should create a valid product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };

      const product = new Product(productData);
      const saved = await product.save();

      expect(saved._id).toBeDefined();
      expect(saved.name).toBe(productData.name);
      expect(saved.price).toBe(productData.price);
      expect(saved.stock).toBe(productData.stock);
    });

    it('should reject product with negative price', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: -10,
        category: 'Electronics',
        stock: 10
      };

      const product = new Product(productData);

      await expect(product.validate()).rejects.toThrow();
    });

    it('should reject product with negative stock', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'Electronics',
        stock: -5
      };

      const product = new Product(productData);

      await expect(product.validate()).rejects.toThrow();
    });

    it('should require name field', async () => {
      const productData = {
        description: 'Test description',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };

      const product = new Product(productData);

      await expect(product.validate()).rejects.toThrow();
    });

    it('should require description field', async () => {
      const productData = {
        name: 'Test Product',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };

      const product = new Product(productData);

      await expect(product.validate()).rejects.toThrow();
    });

    it('should require price field', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        category: 'Electronics',
        stock: 10
      };

      const product = new Product(productData);

      await expect(product.validate()).rejects.toThrow();
    });

    it('should set isActive to true by default', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };

      const product = new Product(productData);
      const saved = await product.save();

      expect(saved.isActive).toBe(true);
    });

    it('should set stock to 0 by default if not provided', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'Electronics'
      };

      const product = new Product(productData);
      const saved = await product.save();

      expect(saved.stock).toBe(0);
    });
  });

  describe('Data persistence', () => {
    it('should save and retrieve product correctly', async () => {
      const productData = {
        name: 'Laptop',
        description: 'High performance laptop',
        price: 1299.99,
        category: 'Electronics',
        stock: 5,
        isActive: true
      };

      const product = new Product(productData);
      const saved = await product.save();

      const retrieved = await Product.findById(saved._id);

      expect(retrieved.name).toBe(productData.name);
      expect(retrieved.description).toBe(productData.description);
      expect(retrieved.price).toBe(productData.price);
      expect(retrieved.category).toBe(productData.category);
      expect(retrieved.stock).toBe(productData.stock);
      expect(retrieved.isActive).toBe(productData.isActive);
    });

    it('should update product correctly', async () => {
      const product = new Product({
        name: 'Old Name',
        description: 'Old description',
        price: 50,
        category: 'Books',
        stock: 10
      });

      await product.save();

      product.name = 'New Name';
      product.price = 75;
      await product.save();

      const updated = await Product.findById(product._id);

      expect(updated.name).toBe('New Name');
      expect(updated.price).toBe(75);
    });

    it('should delete product correctly', async () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      });

      const saved = await product.save();
      await Product.findByIdAndDelete(saved._id);

      const found = await Product.findById(saved._id);

      expect(found).toBeNull();
    });
  });

  describe('Queries', () => {
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
          name: 'Old Product',
          description: 'Discontinued',
          price: 10,
          category: 'Electronics',
          stock: 0,
          isActive: false
        }
      ]);
    });

    it('should find products by category', async () => {
      const electronics = await Product.find({ category: 'Electronics' });

      expect(electronics.length).toBe(3);
    });

    it('should find only active products', async () => {
      const active = await Product.find({ isActive: true });

      expect(active.length).toBe(3);
    });

    it('should find products with stock greater than 0', async () => {
      const inStock = await Product.find({ stock: { $gt: 0 } });

      expect(inStock.length).toBe(3);
    });
  });
});
