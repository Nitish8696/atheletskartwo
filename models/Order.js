const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    products: [
      {
        title: {
          type: String,
        },
        productId: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        variable: {
          type: Object,
          default: null,
        },
        productImageUrl: {
          type: String,
          default: null,
        },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    codFee: { type: Number },
    transationId: { type: String, required: true },
    isQuantityRemoved: {type: Boolean, default : false},
    status: {
      type: String,
      enum: [
        "PAYMENT NOT INITIALIZED",
        "PAYMENT_PENDING",
        "PAYMENT_SUCCESS",
        "PAYMENT_ERROR",
        "INTERNAL_SERVER_ERROR",
        "COD",
      ],
      default: "PAYMENT NOT INITIALIZED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
