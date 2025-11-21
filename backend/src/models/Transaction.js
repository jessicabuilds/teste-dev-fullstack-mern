const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  gatewayTransactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'approved', 'rejected', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  webhookReceived: {
    type: Boolean,
    default: false
  },
  webhookData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

transactionSchema.index({ orderId: 1 });
transactionSchema.index({ gatewayTransactionId: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
