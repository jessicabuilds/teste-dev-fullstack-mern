const mongoose = require('mongoose');
const OrderService = require('../../src/services/OrderService');
const Order = require('../../src/models/Order');
const Cart = require('../../src/models/Cart');
const Product = require('../../src/models/Product');
const User = require('../../src/models/User');
const PaymentGatewayService = require('../../src/services/PaymentGatewayService');
const ProductService = require('../../src/services/ProductService');

jest.mock('../../src/services/PaymentGatewayService');

const generateUniqueEmail = () => {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
};

describe('OrderService', () => {
  let testUser;
  let testProduct;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    await Cart.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    testUser = await User.create({
      name: 'Test User',
      email: generateUniqueEmail(),
      password: 'hashedpassword123',
      role: 'user'
    });

    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test description',
      price: 100,
      category: 'Electronics',
      stock: 10,
      isActive: true
    });

    PaymentGatewayService.createTransaction.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      gatewayTransactionId: 'txn_test_123',
      status: 'pending'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order from cart', async () => {
      const cart = await Cart.create({
        userId: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: testProduct.price
          }
        ],
        total: 200
      });
      
      await cart.populate('items.product');

      const orderData = {
        shippingAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card',
        cardData: { last4: '1234' }
      };

      const order = await OrderService.createOrder(testUser._id, orderData);

      expect(order).toBeDefined();
      expect(order.userId.toString()).toBe(testUser._id.toString());
      expect(order.items).toHaveLength(1);
      expect(order.total).toBe(200);
      expect(order.status).toBe('pending');
      expect(order.paymentStatus).toBe('pending');
      expect(order.orderNumber).toMatch(/^ORD-/);
      expect(PaymentGatewayService.createTransaction).toHaveBeenCalled();
    });

    it('should throw error when cart is empty', async () => {
      await Cart.create({
        userId: testUser._id,
        items: [],
        total: 0
      });

      const orderData = {
        shippingAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      await expect(
        OrderService.createOrder(testUser._id, orderData)
      ).rejects.toThrow('Cart is empty');
    });

    it('should throw error when insufficient stock', async () => {
      const cart = await Cart.create({
        userId: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 20,
            price: testProduct.price
          }
        ],
        total: 2000
      });
      
      await cart.populate('items.product');

      const orderData = {
        shippingAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      await expect(
        OrderService.createOrder(testUser._id, orderData)
      ).rejects.toThrow('Insufficient stock');
    });

    it('should reserve stock when creating order', async () => {
      const cart = await Cart.create({
        userId: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: testProduct.price
          }
        ],
        total: 200
      });
      
      await cart.populate('items.product');

      const orderData = {
        shippingAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      await OrderService.createOrder(testUser._id, orderData);

      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct.stock).toBe(8);
    });

    it('should clear cart after creating order', async () => {
      const cart = await Cart.create({
        userId: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: testProduct.price
          }
        ],
        total: 200
      });
      
      await cart.populate('items.product');

      const orderData = {
        shippingAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card'
      };

      await OrderService.createOrder(testUser._id, orderData);

      const updatedCart = await Cart.findOne({ userId: testUser._id });
      expect(updatedCart.items).toHaveLength(0);
    });
  });

  describe('getOrder', () => {
    it('should get order by id', async () => {
      const order = await Order.create({
        userId: testUser._id,
        orderNumber: 'ORD-TEST-001',
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            price: testProduct.price,
            quantity: 2
          }
        ],
        total: 200,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      });

      const foundOrder = await OrderService.getOrder(order._id);

      expect(foundOrder._id.toString()).toBe(order._id.toString());
      expect(foundOrder.orderNumber).toBe('ORD-TEST-001');
    });

    it('should throw error when order not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(OrderService.getOrder(fakeId)).rejects.toThrow('Order not found');
    });
  });

  describe('getUserOrders', () => {
    it('should get all orders for user', async () => {
      const order1 = await Order.create({
        userId: testUser._id,
        orderNumber: 'ORD-TEST-001',
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            price: testProduct.price,
            quantity: 1
          }
        ],
        total: 100,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const order2 = await Order.create({
        userId: testUser._id,
        orderNumber: 'ORD-TEST-002',
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            price: testProduct.price,
            quantity: 2
          }
        ],
        total: 200,
        status: 'confirmed',
        paymentStatus: 'paid',
        shippingAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      });

      const orders = await OrderService.getUserOrders(testUser._id);

      expect(orders).toHaveLength(2);
      expect(orders[0]._id.toString()).toBe(order2._id.toString());
      expect(orders[1]._id.toString()).toBe(order1._id.toString());
    });

    it('should return empty array when user has no orders', async () => {
      const orders = await OrderService.getUserOrders(testUser._id);

      expect(orders).toHaveLength(0);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const order = await Order.create({
        userId: testUser._id,
        orderNumber: 'ORD-TEST-001',
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            price: testProduct.price,
            quantity: 1
          }
        ],
        total: 100,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      });

      const updatedOrder = await OrderService.updateOrderStatus(order._id, 'confirmed');

      expect(updatedOrder.status).toBe('confirmed');
    });

    it('should throw error for invalid status transition', async () => {
      const order = await Order.create({
        userId: testUser._id,
        orderNumber: 'ORD-TEST-001',
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            price: testProduct.price,
            quantity: 1
          }
        ],
        total: 100,
        status: 'delivered',
        paymentStatus: 'paid',
        shippingAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      });

      await expect(
        OrderService.updateOrderStatus(order._id, 'pending')
      ).rejects.toThrow('Cannot transition from delivered to pending');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order and release stock', async () => {
      await ProductService.reserveStock(testProduct._id, 2);

      const order = await Order.create({
        userId: testUser._id,
        orderNumber: 'ORD-TEST-001',
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            price: testProduct.price,
            quantity: 2
          }
        ],
        total: 200,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      });

      const cancelledOrder = await OrderService.cancelOrder(order._id);

      expect(cancelledOrder.status).toBe('cancelled');

      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct.stock).toBe(10);
    });

    it('should throw error when order cannot be cancelled', async () => {
      const order = await Order.create({
        userId: testUser._id,
        orderNumber: 'ORD-TEST-001',
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            price: testProduct.price,
            quantity: 1
          }
        ],
        total: 100,
        status: 'delivered',
        paymentStatus: 'paid',
        shippingAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      });

      await expect(OrderService.cancelOrder(order._id)).rejects.toThrow(
        'Order cannot be cancelled'
      );
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate unique order numbers', () => {
      const orderNumber1 = OrderService.generateOrderNumber();
      const orderNumber2 = OrderService.generateOrderNumber();

      expect(orderNumber1).toMatch(/^ORD-/);
      expect(orderNumber2).toMatch(/^ORD-/);
      expect(orderNumber1).not.toBe(orderNumber2);
    });
  });
});
