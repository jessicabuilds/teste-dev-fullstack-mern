const mongoose = require('mongoose');
const PaymentGatewayService = require('../../src/services/PaymentGatewayService');
const Transaction = require('../../src/models/Transaction');
const Order = require('../../src/models/Order');

process.env.PAGARME_WEBHOOK_SECRET = 'test_webhook_secret';

describe('PaymentGatewayService', () => {
  let testOrder;
  let originalScheduleWebhook;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    originalScheduleWebhook = PaymentGatewayService.scheduleWebhook;
    PaymentGatewayService.scheduleWebhook = jest.fn();
  });

  afterAll(async () => {
    PaymentGatewayService.scheduleWebhook = originalScheduleWebhook;
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Transaction.deleteMany({});
    await Order.deleteMany({});

    testOrder = await Order.create({
      userId: new mongoose.Types.ObjectId(),
      orderNumber: 'ORD-TEST-001',
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          name: 'Test Product',
          price: 100,
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
  });

  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        orderId: testOrder._id,
        amount: 200,
        paymentMethod: 'credit_card',
        cardData: {
          last4: '1234'
        }
      };

      const transaction = await PaymentGatewayService.createTransaction(transactionData);

      expect(transaction).toBeDefined();
      expect(transaction.orderId.toString()).toBe(testOrder._id.toString());
      expect(transaction.amount).toBe(200);
      expect(transaction.status).toBe('pending');
      expect(transaction.paymentMethod).toBe('credit_card');
      expect(transaction.gatewayTransactionId).toMatch(/^txn_/);
      expect(PaymentGatewayService.scheduleWebhook).toHaveBeenCalled();
    });

    it('should create transaction without card data', async () => {
      const transactionData = {
        orderId: testOrder._id,
        amount: 200,
        paymentMethod: 'pix'
      };

      const transaction = await PaymentGatewayService.createTransaction(transactionData);

      expect(transaction).toBeDefined();
      expect(transaction.paymentMethod).toBe('pix');
    });
  });

  describe('getTransactionStatus', () => {
    it('should get transaction status by gateway transaction id', async () => {
      const transaction = await Transaction.create({
        orderId: testOrder._id,
        gatewayTransactionId: 'txn_test_123',
        amount: 200,
        status: 'approved',
        paymentMethod: 'credit_card'
      });

      const status = await PaymentGatewayService.getTransactionStatus('txn_test_123');

      expect(status.transactionId).toBe('txn_test_123');
      expect(status.status).toBe('approved');
      expect(status.amount).toBe(200);
    });

    it('should throw error when transaction not found', async () => {
      await expect(
        PaymentGatewayService.getTransactionStatus('txn_nonexistent')
      ).rejects.toThrow('Transaction not found');
    });
  });

  describe('validateWebhookSignature', () => {
    it('should reject invalid webhook signature', () => {
      const payload = {
        event: 'transaction.status_changed',
        transaction: {
          id: 'txn_123',
          status: 'approved'
        }
      };

      const isValid = PaymentGatewayService.validateWebhookSignature(payload, 'invalid_signature');

      expect(isValid).toBe(false);
    });

    it('should return false when webhook secret is not configured', () => {
      const originalSecret = PaymentGatewayService.webhookSecret;
      PaymentGatewayService.webhookSecret = null;

      const payload = { test: 'data' };
      const isValid = PaymentGatewayService.validateWebhookSignature(payload, 'any_signature');

      expect(isValid).toBe(false);

      PaymentGatewayService.webhookSecret = originalSecret;
    });
  });

  describe('generateTransactionId', () => {
    it('should generate unique transaction ids', () => {
      const id1 = PaymentGatewayService.generateTransactionId();
      const id2 = PaymentGatewayService.generateTransactionId();

      expect(id1).toMatch(/^txn_/);
      expect(id2).toMatch(/^txn_/);
      expect(id1).not.toBe(id2);
    });
  });
});
