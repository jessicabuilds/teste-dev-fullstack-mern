const Cart = require('../models/Cart');
const ProductService = require('./ProductService');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ userId }).populate('items.product');

    if (!cart) {
      cart = new Cart({ userId, items: [], total: 0 });
      await cart.save();
    }

    return cart;
  }

  async addItem(userId, itemData) {
    const { productId, quantity } = itemData;

    if (!quantity || quantity < 1) {
      throw new ValidationError('Quantity must be at least 1');
    }

    const product = await ProductService.getProduct(productId);

    if (!product.isActive) {
      throw new ValidationError('Product is not available');
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      // Item já existe no carrinho - adicionar mais quantidade
      const oldQuantity = cart.items[existingItemIndex].quantity;
      const newQuantity = oldQuantity + quantity;

      const hasStockForNew = await ProductService.checkStock(productId, newQuantity);
      if (!hasStockForNew) {
        throw new ConflictError('Insufficient stock for this quantity');
      }

      await ProductService.reserveStock(productId, quantity);

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      const hasStock = await ProductService.checkStock(productId, quantity);
      if (!hasStock) {
        throw new ConflictError('Insufficient stock for this product');
      }

      await ProductService.reserveStock(productId, quantity);

      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();
    await cart.populate('items.product');

    return cart;
  }

  async updateItem(userId, productId, quantity) {
    if (quantity < 1) {
      throw new ValidationError('Quantity must be at least 1');
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Item not found in cart');
    }

    const oldQuantity = cart.items[itemIndex].quantity;
    const quantityDiff = quantity - oldQuantity;

    if (quantityDiff > 0) {
      const hasStock = await ProductService.checkStock(productId, quantityDiff);
      if (!hasStock) {
        throw new ConflictError('Insufficient stock for this quantity');
      }
      await ProductService.reserveStock(productId, quantityDiff);
    } else if (quantityDiff < 0) {
      await ProductService.releaseStock(productId, Math.abs(quantityDiff));
    }

    const product = await ProductService.getProduct(productId);
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;

    await cart.save();
    await cart.populate('items.product');

    return cart;
  }

  async removeItem(userId, productId) {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Item not found in cart');
    }

    const quantity = cart.items[itemIndex].quantity;
    await ProductService.releaseStock(productId, quantity);

    cart.items.splice(itemIndex, 1);

    await cart.save();
    await cart.populate('items.product');

    return cart;
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    for (const item of cart.items) {
      await ProductService.releaseStock(item.product.toString(), item.quantity);
    }

    cart.items = [];
    cart.total = 0;

    await cart.save();

    return cart;
  }

  async calculateTotal(cart) {
    return cart.calculateTotal();
  }

  async validateCartStock(userId) {
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return false;
    }

    for (const item of cart.items) {
      const hasStock = await ProductService.checkStock(
        item.product.toString(),
        item.quantity
      );

      if (!hasStock) {
        return false;
      }
    }

    return true;
  }
}

module.exports = new CartService();
