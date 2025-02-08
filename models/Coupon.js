const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponTitle: {
    type: String,
    required: true,
    trim: true,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    // max: 100, // Restrict the percentage between 0 and 100
  },
  minQuantity: {
    type: Number,
    required: true,
    min: 1, // Minimum quantity required to use the coupon
  },
  expirationDate: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true, // This will add createdAt and updatedAt fields
});

module.exports = mongoose.model('Coupon', couponSchema);
