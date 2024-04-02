const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema(
    {
        subTotal: {
            type: Number,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        order_id: {
            type: String,
            require: true
        },
        order: {
            type: mongoose.Schema.ObjectId,
            ref: 'Order',
            required: false,
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model('Order', OrderSchema);
