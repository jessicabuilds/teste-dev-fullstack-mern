const fc = require('fast-check');
const mongoose = require('mongoose');
const Product = require('../../src/models/Product');

describe('Product Property Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  describe('Property 9: Product validation', () => {
    it('should reject products with negative price', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            price: fc.integer({ min: -1000, max: -1 }),
            category: fc.string({ minLength: 1, maxLength: 50 }),
            stock: fc.integer({ min: 0, max: 1000 })
          }),
          async (productData) => {
            const product = new Product(productData);
            
            try {
              await product.validate();
              return false;
            } catch (error) {
              return error.errors.price !== undefined;
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject products with negative stock', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
            category: fc.string({ minLength: 1, maxLength: 50 }),
            stock: fc.integer({ min: -1000, max: -1 })
          }),
          async (productData) => {
            const product = new Product(productData);
            
            try {
              await product.validate();
              return false;
            } catch (error) {
              return error.errors.stock !== undefined;
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should accept valid products', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
            category: fc.string({ minLength: 1, maxLength: 50 }),
            stock: fc.integer({ min: 0, max: 1000 })
          }),
          async (productData) => {
            const product = new Product(productData);
            
            try {
              await product.validate();
              return true;
            } catch (error) {
              return false;
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 47: Product round-trip preserves data', () => {
    const nonEmptyString = (minLength, maxLength) => 
      fc.string({ minLength, maxLength })
        .filter(s => s.trim().length > 0);

    it('should preserve all product data through save and retrieve', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: nonEmptyString(1, 100),
            description: nonEmptyString(1, 500),
            price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
            category: nonEmptyString(1, 50),
            stock: fc.integer({ min: 0, max: 1000 }),
            isActive: fc.boolean()
          }),
          async (productData) => {
            const product = new Product(productData);
            const saved = await product.save();
            
            const retrieved = await Product.findById(saved._id);
            
            return (
              retrieved.name === productData.name.trim() &&
              retrieved.description === productData.description &&
              Math.abs(retrieved.price - productData.price) < 0.01 &&
              retrieved.category === productData.category.trim() &&
              retrieved.stock === productData.stock &&
              retrieved.isActive === productData.isActive
            );
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should preserve product data through JSON serialization', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: nonEmptyString(1, 100),
            description: nonEmptyString(1, 500),
            price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
            category: nonEmptyString(1, 50),
            stock: fc.integer({ min: 0, max: 1000 })
          }),
          async (productData) => {
            const product = new Product(productData);
            const saved = await product.save();
            
            const json = JSON.stringify(saved.toJSON());
            const parsed = JSON.parse(json);
            
            return (
              parsed.name === productData.name.trim() &&
              parsed.description === productData.description &&
              Math.abs(parsed.price - productData.price) < 0.01 &&
              parsed.category === productData.category.trim() &&
              parsed.stock === productData.stock
            );
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
