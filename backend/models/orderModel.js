const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema(
    {
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
        clerk: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        customer: {
            type: mongoose.Schema.ObjectId,
            ref: 'Customer',
            required: false,
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model('Order', OrderSchema);
