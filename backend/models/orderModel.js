const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema(
    {
        cartItems: [],
        subTotal: {
            type: Number,
            default: 0
        },
        invoice: {},
        totalAmount: {
            type: Number,
            default: 0
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        redeemAmount: {
            type: Number,
            default: 0,
        },
        customTotalAmount: {
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
        carrier_id: {
            type: String
        },
        buyer_id: {
            type: String
        },
        redeem_points: {
            type: Number
        },
        orderType: {
            type: String,
            default: 0
        },
        synced: {
            type: Boolean,
            default: false
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model('Order', OrderSchema);
