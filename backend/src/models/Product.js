const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  imageUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ name: 1 });

module.exports = mongoose.model('Product', productSchema);
