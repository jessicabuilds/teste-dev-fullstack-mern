const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

cartSchema.index({ userId: 1 });

cartSchema.methods.calculateTotal = function() {
  this.total = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  return this.total;
};

cartSchema.pre('save', function(next) {
  this.calculateTotal();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
