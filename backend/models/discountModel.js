const mongoose = require('mongoose');

const DiscountSchema = mongoose.Schema(
    {
        exclusive: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String
        },
        priority: {
            type: Number,
            default: 1,
        },
        filters: {
            type: Object
        },
        conditions: {
            type: Object
        },
        discount_type: {
            type: String
        },
        adjustments: {
            type: Object
        },
        additional: {
            type: Object
        },

    },
    {timestamps: true}
);

module.exports = mongoose.model('Discount', DiscountSchema);
