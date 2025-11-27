const Cart = require('../models/Cart');
const Product = require('../models/Product');
const logger = require('../config/logger');

class CartCleanupJob {
  async run() {
    try {
      logger.info('Iniciando limpeza de carrinhos abandonados...');

      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const abandonedCarts = await Cart.find({
        updatedAt: { $lt: twentyFourHoursAgo }
      });

      if (abandonedCarts.length === 0) {
        logger.info('Nenhum carrinho abandonado encontrado');
        return;
      }

      logger.info(`Encontrados ${abandonedCarts.length} carrinhos abandonados`);

      let successCount = 0;
      let errorCount = 0;

      for (const cart of abandonedCarts) {
        try {
          await this.cleanupCart(cart);
          successCount++;
        } catch (error) {
          errorCount++;
          logger.error(`Erro ao limpar carrinho ${cart._id}:`, error);
        }
      }

      logger.info(`Limpeza concluída: ${successCount} carrinhos removidos, ${errorCount} erros`);
    } catch (error) {
      logger.error('Erro no CartCleanupJob:', error);
    }
  }

  async cleanupCart(cart) {
    try {
      logger.info(`Limpando carrinho ${cart._id} do usuário ${cart.userId}`);

      // Liberar estoque dos produtos
      for (const item of cart.items) {
        try {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
          logger.info(`Estoque liberado: Produto ${item.product} - Quantidade: ${item.quantity}`);
        } catch (error) {
          logger.error(`Erro ao liberar estoque do produto ${item.product}:`, error);
        }
      }

      await Cart.findByIdAndDelete(cart._id);

      logger.info(`Carrinho ${cart._id} removido com sucesso`);
    } catch (error) {
      logger.error(`Erro ao limpar carrinho ${cart._id}:`, error);
      throw error;
    }
  }
}

module.exports = new CartCleanupJob();
