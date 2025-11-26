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

  describe('createProduct - Bulk Creation', () => {
    describe('when receiving an array of products', () => {
      it('should create all valid products successfully', async () => {
        const productsData = [
          {
            name: 'Product 1',
            description: 'Description 1',
            price: 100,
            category: 'Electronics',
            stock: 10
          },
          {
            name: 'Product 2',
            description: 'Description 2',
            price: 200,
            category: 'Books',
            stock: 20
          },
          {
            name: 'Product 3',
            description: 'Description 3',
            price: 300,
            category: 'Electronics',
            stock: 30
          }
        ];

        const result = await ProductService.createProduct(productsData);

        expect(result.success).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.success.length).toBe(3);
        expect(result.errors.length).toBe(0);
        expect(result.success[0].name).toBe('Product 1');
        expect(result.success[1].name).toBe('Product 2');
        expect(result.success[2].name).toBe('Product 3');
      });

      it('should handle partial success when some products are invalid', async () => {
        const productsData = [
          {
            name: 'Valid Product',
            description: 'Valid description',
            price: 100,
            category: 'Electronics',
            stock: 10
          },
          {
            name: '', // Invalid: empty name
            description: 'Invalid product',
            price: 200,
            category: 'Books',
            stock: 20
          },
          {
            name: 'Another Valid Product',
            description: 'Another valid description',
            price: 300,
            category: 'Electronics',
            stock: 30
          }
        ];

        const result = await ProductService.createProduct(productsData);

        expect(result.success.length).toBe(2);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].index).toBe(1);
        expect(result.success[0].name).toBe('Valid Product');
        expect(result.success[1].name).toBe('Another Valid Product');
      });

      it('should return all errors when all products are invalid', async () => {
        const productsData = [
          {
            name: '', // Invalid: empty name
            description: 'Description 1',
            price: 100,
            category: 'Electronics',
            stock: 10
          },
          {
            name: 'Product 2',
            description: '', // Invalid: empty description
            price: 200,
            category: 'Books',
            stock: 20
          }
        ];

        const result = await ProductService.createProduct(productsData);

        expect(result.success.length).toBe(0);
        expect(result.errors.length).toBe(2);
        expect(result.errors[0].index).toBe(0);
        expect(result.errors[1].index).toBe(1);
      });

      it('should include product data and error message in error objects', async () => {
        const productsData = [
          {
            name: '',
            description: 'Invalid product',
            price: 100,
            category: 'Electronics',
            stock: 10
          }
        ];

        const result = await ProductService.createProduct(productsData);

        expect(result.errors.length).toBe(1);
        expect(result.errors[0].index).toBe(0);
        expect(result.errors[0].product).toEqual(productsData[0]);
        expect(result.errors[0].error).toBeDefined();
        expect(typeof result.errors[0].error).toBe('string');
      });

      it('should process products independently', async () => {
        const productsData = [
          {
            name: 'Product 1',
            description: 'Description 1',
            price: 100,
            category: 'Electronics',
            stock: 10
          },
          {
            name: '', // This will fail
            description: 'Description 2',
            price: 200,
            category: 'Books',
            stock: 20
          },
          {
            name: 'Product 3',
            description: 'Description 3',
            price: 300,
            category: 'Electronics',
            stock: 30
          },
          {
            name: 'Product 4',
            description: '', // This will fail
            price: 400,
            category: 'Books',
            stock: 40
          }
        ];

        const result = await ProductService.createProduct(productsData);

        expect(result.success.length).toBe(2);
        expect(result.errors.length).toBe(2);
        expect(result.errors[0].index).toBe(1);
        expect(result.errors[1].index).toBe(3);
      });

      it('should assign unique IDs to all created products', async () => {
        const productsData = [
          {
            name: 'Product 1',
            description: 'Description 1',
            price: 100,
            category: 'Electronics',
            stock: 10
          },
          {
            name: 'Product 2',
            description: 'Description 2',
            price: 200,
            category: 'Books',
            stock: 20
          }
        ];

        const result = await ProductService.createProduct(productsData);

        expect(result.success.length).toBe(2);
        expect(result.success[0]._id).toBeDefined();
        expect(result.success[1]._id).toBeDefined();
        expect(result.success[0]._id.toString()).not.toBe(result.success[1]._id.toString());
      });
    });

    describe('backward compatibility', () => {
      it('should maintain original behavior for single product object', async () => {
        const productData = {
          name: 'Single Product',
          description: 'Single description',
          price: 99.99,
          category: 'Electronics',
          stock: 15
        };

        const product = await ProductService.createProduct(productData);

        // Should return a single product object, not a result object
        expect(product._id).toBeDefined();
        expect(product.name).toBe(productData.name);
        expect(product.price).toBe(productData.price);
        expect(product.success).toBeUndefined();
        expect(product.errors).toBeUndefined();
      });
    });
  });
});
