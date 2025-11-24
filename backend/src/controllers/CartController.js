const CartService = require('../services/CartService');

class CartController {
  async getCart(req, res, next) {
    try {
      const cart = await CartService.getCart(req.user.id);

      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const { productId, quantity } = req.body;

      const cart = await CartService.addItem(req.user.id, {
        productId,
        quantity
      });

      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;

      const cart = await CartService.updateItem(req.user.id, productId, quantity);

      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const { productId } = req.params;

      const cart = await CartService.removeItem(req.user.id, productId);

      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const cart = await CartService.clearCart(req.user.id);

      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
