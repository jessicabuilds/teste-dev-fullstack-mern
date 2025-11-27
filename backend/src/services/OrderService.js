const Order = require('../models/Order');
const Cart = require('../models/Cart');
const ProductService = require('./ProductService');
const PaymentGatewayService = require('./PaymentGatewayService');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');

class OrderService {
  async createOrder(userId, orderData) {
    const { shippingAddress, paymentMethod, cardData } = orderData;

    const cart = await Cart.findOne({ userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    for (const item of cart.items) {
      const hasStock = await ProductService.checkStock(item.product._id, item.quantity);
      if (!hasStock) {
        throw new ConflictError(`Insufficient stock for product: ${item.product.name}`);
      }
    }

    const orderNumber = this.generateOrderNumber();

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.price,
      quantity: item.quantity
    }));

    const order = new Order({
      userId,
      orderNumber,
      items: orderItems,
      total: cart.total,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress
    });

    await order.save();

    const transaction = await PaymentGatewayService.createTransaction({
      orderId: order._id,
      amount: order.total,
      paymentMethod,
      cardData
    });

    cart.items = [];
    cart.total = 0;
    await cart.save();

    return order;
  }

  async getOrder(orderId) {
    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  async getUserOrders(userId) {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('items.product');

    return orders;
  }

  async updateOrderStatus(orderId, status) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const validTransitions = {
      pending: ['confirmed', 'cancelled', 'failed'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
      failed: []
    };

    const allowedStatuses = validTransitions[order.status];

    if (!allowedStatuses.includes(status)) {
      throw new ValidationError(`Cannot transition from ${order.status} to ${status}`);
    }

    order.status = status;
    await order.save();

    return order;
  }

  async cancelOrder(orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (!['pending', 'confirmed', 'processing'].includes(order.status)) {
      throw new ValidationError('Order cannot be cancelled');
    }

    order.status = 'cancelled';
    await order.save();

    if (order.paymentStatus === 'pending' || order.paymentStatus === 'failed') {
      for (const item of order.items) {
        await ProductService.releaseStock(item.product, item.quantity);
      }
    }

    return order;
  }

  generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }
}

module.exports = new OrderService();
