const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const Product = require('../models/Product');
const PaymentGatewayService = require('../services/PaymentGatewayService');
const logger = require('../config/logger');

class PaymentSyncJob {
  async run() {
    try {
      logger.info('Iniciando sincronização de pagamentos...');

      const transactions = await Transaction.find({
        status: { $in: ['pending', 'processing'] }
      }).populate('orderId');

      if (transactions.length === 0) {
        logger.info('Nenhuma transação pendente encontrada');
        return;
      }

      logger.info(`Encontradas ${transactions.length} transações para sincronizar`);

      let successCount = 0;
      let errorCount = 0;

      for (const transaction of transactions) {
        try {
          await this.syncTransaction(transaction);
          successCount++;
        } catch (error) {
          errorCount++;
          logger.error(`Erro ao sincronizar transação ${transaction._id}:`, error);
        }
      }

      logger.info(`Sincronização concluída: ${successCount} sucesso, ${errorCount} erros`);
    } catch (error) {
      logger.error('Erro no PaymentSyncJob:', error);
    }
  }

  async syncTransaction(transaction) {
    try {
      const gatewayStatus = await PaymentGatewayService.getTransactionStatus(
        transaction.gatewayTransactionId
      );

      if (gatewayStatus.status === transaction.status) {
        return;
      }

      logger.info(`Atualizando transação ${transaction._id}: ${transaction.status} -> ${gatewayStatus.status}`);

      transaction.status = gatewayStatus.status;
      transaction.gatewayResponse = gatewayStatus;
      await transaction.save();

      const order = await Order.findById(transaction.orderId);
      if (!order) {
        logger.error(`Pedido ${transaction.orderId} não encontrado`);
        return;
      }

      if (gatewayStatus.status === 'paid') {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();
        logger.info(`Pedido ${order._id} marcado como pago`);
      } else if (gatewayStatus.status === 'failed') {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        await order.save();

        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }

        logger.info(`Pedido ${order._id} cancelado e estoque liberado`);
      }
    } catch (error) {
      logger.error(`Erro ao sincronizar transação ${transaction._id}:`, error);
      throw error;
    }
  }
}

module.exports = new PaymentSyncJob();
