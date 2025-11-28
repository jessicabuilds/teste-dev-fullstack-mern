const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const Product = require('../models/Product');
const PaymentGatewayService = require('../services/PaymentGatewayService');
const logger = require('../config/logger');

class PaymentSyncJob {
  async run() {
    try {
      logger.info('Iniciando sincronização de pagamentos...');

      // Buscar transações que precisam ser sincronizadas
      const transactions = await Transaction.find({
        status: { $in: ['pending', 'processing', 'approved', 'rejected'] }
      }).populate('orderId');

      if (transactions.length === 0) {
        logger.info('Nenhuma transação para sincronizar');
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
      const order = await Order.findById(transaction.orderId);
      if (!order) {
        logger.error(`Pedido ${transaction.orderId} não encontrado`);
        return;
      }

      // Se o pedido já foi sincronizado, pular
      if (order.paymentStatus === 'paid' || order.paymentStatus === 'failed') {
        return;
      }

      // Verificar status da transação
      if (transaction.status === 'approved') {
        logger.info(`Sincronizando pedido ${order._id}: transação aprovada`);
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        await order.save();
        logger.info(`Pedido ${order._id} marcado como pago`);
      } else if (transaction.status === 'rejected') {
        logger.info(`Sincronizando pedido ${order._id}: transação rejeitada`);
        order.paymentStatus = 'failed';
        order.status = 'failed';
        await order.save();

        // Liberar estoque
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
