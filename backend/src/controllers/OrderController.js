const OrderService = require('../services/OrderService');

class OrderController {
  async checkout(req, res, next) {
    try {
      const { shippingAddress, paymentMethod, cardData } = req.body;

      const order = await OrderService.createOrder(req.user.id, {
        shippingAddress,
        paymentMethod,
        cardData
      });

      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrder(req, res, next) {
    try {
      const order = await OrderService.getOrder(req.params.id);

      if (order.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserOrders(req, res, next) {
    try {
      const orders = await OrderService.getUserOrders(req.user.id);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const order = await OrderService.getOrder(req.params.id);

      if (order.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const cancelledOrder = await OrderService.cancelOrder(req.params.id);

      res.status(200).json({
        success: true,
        data: cancelledOrder
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
