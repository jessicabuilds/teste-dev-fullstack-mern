const mongoose = require('mongoose');
const CartService = require('../../src/services/CartService');
const Cart = require('../../src/models/Cart');
const Product = require('../../src/models/Product');
const User = require('../../src/models/User');

describe('CartService', () => {
  let testUser;
  let testProduct1;
  let testProduct2;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Cart.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: 'user'
    });

    testProduct1 = await Product.create({
      name: 'Product 1',
      description: 'Description 1',
      price: 100,
      category: 'Electronics',
      stock: 10,
      isActive: true
    });

    testProduct2 = await Product.create({
      name: 'Product 2',
      description: 'Description 2',
      price: 50,
      category: 'Books',
      stock: 5,
      isActive: true
    });
  });

  describe('getCart', () => {
    it('should create and return empty cart if not exists', async () => {
      const cart = await CartService.getCart(testUser._id);

      expect(cart).toBeDefined();
      expect(cart.userId.toString()).toBe(testUser._id.toString());
      expect(cart.items).toHaveLength(0);
      expect(cart.total).toBe(0);
    });

    it('should return existing cart', async () => {
      await Cart.create({
        userId: testUser._id,
        items: [
          {
            product: testProduct1._id,
            quantity: 2,
            price: testProduct1.price
          }
        ]
      });

      const cart = await CartService.getCart(testUser._id);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(2);
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', async () => {
      const cart = await CartService.addItem(testUser._id, {
        productId: testProduct1._id,
        quantity: 2
      });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.items[0].price).toBe(testProduct1.price);
      expect(cart.total).toBe(200);
    });

    it('should update quantity if product already in cart', async () => {
      await CartService.addItem(testUser._id, {
        productId: testProduct1._id,
        quantity: 2
      });

      const cart = await CartService.addItem(testUser._id, {
        productId: testProduct1._id,
        quantity: 3
      });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
    });

    it('should throw error when quantity is invalid', async () => {
      await expect(
        CartService.addItem(testUser._id, {
          productId: testProduct1._id,
          quantity: 0
        })
      ).rejects.toThrow('Quantity must be at least 1');
    });

    it('should throw error when product is not active', async () => {
      const inactiveProduct = await Product.create({
        name: 'Inactive Product',
        description: 'Test',
        price: 100,
        category: 'Test',
        stock: 10,
        isActive: false
      });

      await expect(
        CartService.addItem(testUser._id, {
          productId: inactiveProduct._id,
          quantity: 1
        })
      ).rejects.toThrow('Product is not available');
    });

    it('should throw error when insufficient stock', async () => {
      await expect(
        CartService.addItem(testUser._id, {
          productId: testProduct1._id,
          quantity: 20
        })
      ).rejects.toThrow('Insufficient stock');
    });
  });

  describe('updateItem', () => {
    beforeEach(async () => {
      await CartService.addItem(testUser._id, {
        productId: testProduct1._id,
        quantity: 2
      });
    });

    it('should update item quantity', async () => {
      const cart = await CartService.updateItem(testUser._id, testProduct1._id, 5);

      expect(cart.items[0].quantity).toBe(5);
      expect(cart.total).toBe(500);
    });

    it('should throw error when quantity is less than 1', async () => {
      await expect(
        CartService.updateItem(testUser._id, testProduct1._id, 0)
      ).rejects.toThrow('Quantity must be at least 1');
    });

    it('should throw error when cart not found', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();

      await expect(
        CartService.updateItem(fakeUserId, testProduct1._id, 3)
      ).rejects.toThrow('Cart not found');
    });

    it('should throw error when item not in cart', async () => {
      await expect(
        CartService.updateItem(testUser._id, testProduct2._id, 3)
      ).rejects.toThrow('Item not found in cart');
    });

    it('should throw error when insufficient stock', async () => {
      await expect(
        CartService.updateItem(testUser._id, testProduct1._id, 20)
      ).rejects.toThrow('Insufficient stock');
    });
  });

  describe('removeItem', () => {
    beforeEach(async () => {
      await CartService.addItem(testUser._id, {
        productId: testProduct1._id,
        quantity: 2
      });
      await CartService.addItem(testUser._id, {
        productId: testProduct2._id,
        quantity: 1
      });
    });

    it('should remove item from cart', async () => {
      const cart = await CartService.removeItem(testUser._id, testProduct1._id);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].product._id.toString()).toBe(testProduct2._id.toString());
    });

    it('should throw error when cart not found', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();

      await expect(
        CartService.removeItem(fakeUserId, testProduct1._id)
      ).rejects.toThrow('Cart not found');
    });

    it('should throw error when item not in cart', async () => {
      const fakeProductId = new mongoose.Types.ObjectId();

      await expect(
        CartService.removeItem(testUser._id, fakeProductId)
      ).rejects.toThrow('Item not found in cart');
    });
  });

  describe('clearCart', () => {
    beforeEach(async () => {
      await CartService.addItem(testUser._id, {
        productId: testProduct1._id,
        quantity: 2
      });
    });

    it('should clear all items from cart', async () => {
      const cart = await CartService.clearCart(testUser._id);

      expect(cart.items).toHaveLength(0);
      expect(cart.total).toBe(0);
    });

    it('should throw error when cart not found', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();

      await expect(CartService.clearCart(fakeUserId)).rejects.toThrow('Cart not found');
    });
  });

  describe('calculateTotal', () => {
    it('should calculate cart total correctly', async () => {
      const cart = await Cart.create({
        userId: testUser._id,
        items: [
          {
            product: testProduct1._id,
            quantity: 2,
            price: 100
          },
          {
            product: testProduct2._id,
            quantity: 3,
            price: 50
          }
        ]
      });

      const total = await CartService.calculateTotal(cart);

      expect(total).toBe(350);
    });
  });

  describe('validateCartStock', () => {
    it('should return true when all items have sufficient stock', async () => {
      await CartService.addItem(testUser._id, {
        productId: testProduct1._id,
        quantity: 2
      });

      const isValid = await CartService.validateCartStock(testUser._id);

      expect(isValid).toBe(true);
    });

    it('should return false when cart is empty', async () => {
      await CartService.getCart(testUser._id);

      const isValid = await CartService.validateCartStock(testUser._id);

      expect(isValid).toBe(false);
    });

    it('should return false when item has insufficient stock', async () => {
      const cart = await CartService.getCart(testUser._id);
      cart.items.push({
        product: testProduct1._id,
        quantity: 20,
        price: testProduct1.price
      });
      await cart.save();

      const isValid = await CartService.validateCartStock(testUser._id);

      expect(isValid).toBe(false);
    });
  });
});
