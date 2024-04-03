const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema(
    {
        cartItems: [],
        subTotal: {
            type: Number,
            required: true,
        },
        invoice: {},
        totalAmount: {
            type: Number,
            required: true,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        redeemAmount: {
            type: Number,
            default: 0,
        },
        paymentMethod: {
            type: String,
            require: true
        },
        order_id: {
            type: Number,
            required: true
        },
        clerk: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        customer: {
            type: mongoose.Schema.ObjectId,
            ref: 'Customer',
            required: false,
        },
        orderType: {
            type: String,
            default: 0
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model('Order', OrderSchema);
