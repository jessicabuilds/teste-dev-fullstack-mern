const PaymentGatewayService = require('../services/PaymentGatewayService');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const ProductService = require('../services/ProductService');
const logger = require('../config/logger');

const processedWebhooks = new Set();

async function handlePaymentWebhook(req, res) {
  try {
    const signature = req.headers['x-webhook-signature'];
    const payload = req.body;

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing webhook signature'
      });
    }

    const isValid = PaymentGatewayService.validateWebhookSignature(payload, signature);

    if (!isValid) {
      logger.warn('Invalid webhook signature received');
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    const { transaction: transactionData } = payload;
    const { id: gatewayTransactionId, status } = transactionData;

    const webhookId = `${gatewayTransactionId}_${status}`;
    if (processedWebhooks.has(webhookId)) {
      logger.info(`Webhook already processed: ${webhookId}`);
      return res.status(200).json({
        success: true,
        message: 'Webhook already processed'
      });
    }

    const transaction = await Transaction.findOne({ gatewayTransactionId });

    if (!transaction) {
      logger.warn(`Transaction not found: ${gatewayTransactionId}`);
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.status === status) {
      logger.info(`Transaction ${gatewayTransactionId} already has status ${status}`);
      return res.status(200).json({
        success: true,
        message: 'Status already updated'
      });
    }

    transaction.status = status;
    transaction.webhookReceived = true;
    transaction.gatewayResponse = {
      ...transaction.gatewayResponse,
      webhookTimestamp: new Date(),
      webhookStatus: status
    };
    await transaction.save();

    const order = await Order.findById(transaction.orderId);

    if (!order) {
      logger.error(`Order not found for transaction: ${transaction._id}`);
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (status === 'approved') {
      order.status = 'confirmed';
      order.paymentStatus = 'paid';

      for (const item of order.items) {
        await ProductService.reserveStock(item.productId, item.quantity);
      }

      logger.info(`Order ${order._id} confirmed - Payment approved`);
    } else if (status === 'rejected') {
      order.status = 'cancelled';
      order.paymentStatus = 'failed';

      for (const item of order.items) {
        await ProductService.releaseStock(item.productId, item.quantity);
      }

      logger.info(`Order ${order._id} cancelled - Payment rejected`);
    }

    await order.save();

    processedWebhooks.add(webhookId);

    setTimeout(() => {
      processedWebhooks.delete(webhookId);
    }, 60000);

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

module.exports = { handlePaymentWebhook };
