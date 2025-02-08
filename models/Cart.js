const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    cartId: { type: String, required: true, unique: true },
    cart: { type: Array, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true } // No need for `expires: 0` here
  }
);

// Create TTL index on `expiresAt` field
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2592000 }); // 0 means expire right after `expiresAt`

module.exports = mongoose.model("Cart", CartSchema);