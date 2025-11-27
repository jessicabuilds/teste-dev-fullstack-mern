const cron = require('node-cron');
const PaymentSyncJob = require('./PaymentSyncJob');
const CartCleanupJob = require('./CartCleanupJob');
const logger = require('../config/logger');

class CronJobScheduler {
  start() {
    logger.info('Iniciando agendamento de cronjobs...');

    cron.schedule('*/5 * * * *', async () => {
      logger.info('Executando PaymentSyncJob...');
      try {
        await PaymentSyncJob.run();
      } catch (error) {
        logger.error('Erro ao executar PaymentSyncJob:', error);
      }
    });

    cron.schedule('0 2 * * *', async () => {
      logger.info('Executando CartCleanupJob...');
      try {
        await CartCleanupJob.run();
      } catch (error) {
        logger.error('Erro ao executar CartCleanupJob:', error);
      }
    });

    logger.info('Cronjobs agendados com sucesso');
    logger.info('- PaymentSyncJob: A cada 5 minutos');
    logger.info('- CartCleanupJob: Diariamente às 2 AM');
  }
}

module.exports = new CronJobScheduler();
