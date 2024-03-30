const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema(
  {
    phone: {
      type: Number,
      required: true
    },
    cartItems: [],
    subTotal: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    payment: {
      type: String,
      require: true
    },
    order_id: {
      type: Number,
      required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
