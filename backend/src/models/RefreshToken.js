const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 });

refreshTokenSchema.methods.isValid = function() {
  return !this.isRevoked && this.expiresAt > new Date();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
