const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const { ValidationError } = require('../utils/errors');

class PaymentGatewayService {
  constructor() {
    this.apiKey = process.env.PAGARME_API_KEY;
    this.webhookSecret = process.env.PAGARME_WEBHOOK_SECRET;
  }

  async createTransaction(transactionData) {
    const { orderId, amount, paymentMethod, cardData } = transactionData;

    const gatewayTransactionId = this.generateTransactionId();

    const transaction = new Transaction({
      orderId,
      gatewayTransactionId,
      amount,
      status: 'pending',
      paymentMethod,
      cardLast4: cardData?.last4,
      gatewayResponse: {
        message: 'Transaction created',
        timestamp: new Date()
      },
      webhookReceived: false
    });

    await transaction.save();

    this.scheduleWebhook(transaction._id, gatewayTransactionId);

    return transaction;
  }

  async getTransactionStatus(transactionId) {
    const transaction = await Transaction.findOne({ gatewayTransactionId: transactionId });

    if (!transaction) {
      throw new ValidationError('Transaction not found');
    }

    return {
      transactionId: transaction.gatewayTransactionId,
      status: transaction.status,
      amount: transaction.amount,
      updatedAt: transaction.updatedAt
    };
  }

  validateWebhookSignature(payload, signature) {
    if (!this.webhookSecret) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === expectedSignature;
  }

  scheduleWebhook(transactionId, gatewayTransactionId) {
    const delay = Math.floor(Math.random() * 3000) + 2000;

    console.log(`[PaymentGateway] Agendando webhook para transação ${gatewayTransactionId} em ${delay}ms`);

    setTimeout(async () => {
      try {
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
          console.error(`[PaymentGateway] Transação ${transactionId} não encontrada`);
          return;
        }

        const isApproved = Math.random() > 0.3;
        const newStatus = isApproved ? 'approved' : 'rejected';

        console.log(`[PaymentGateway] Atualizando transação ${gatewayTransactionId}: ${transaction.status} -> ${newStatus}`);

        transaction.status = newStatus;
        transaction.gatewayResponse = {
          ...transaction.gatewayResponse,
          status: newStatus,
          message: isApproved ? 'Payment approved' : 'Payment rejected',
          timestamp: new Date()
        };

        await transaction.save();
        console.log(`[PaymentGateway] Transação ${gatewayTransactionId} salva com status ${newStatus}`);

        await this.simulateWebhookCall(gatewayTransactionId, newStatus);
      } catch (error) {
        console.error('[PaymentGateway] Error in scheduled webhook:', error);
      }
    }, delay);
  }

  async simulateWebhookCall(gatewayTransactionId, status) {
    const payload = {
      event: 'transaction.status_changed',
      transaction: {
        id: gatewayTransactionId,
        status,
        timestamp: new Date().toISOString()
      }
    };

    const signature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    console.log(`[Simulated Webhook] Transaction ${gatewayTransactionId} - Status: ${status}`);

    return { payload, signature };
  }

  generateTransactionId() {
    return `txn_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
}

module.exports = new PaymentGatewayService();
