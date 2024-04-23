const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
	{
		sku: {
			type: String
		},
		barcode: {
			type: String
		},
		categories_ids: [],
		product_ids: [],
		name: {
			type: String,
			trim: true
		},
		price: {
			type: Number,
			default: 0,
		},
		original_price: {
			type: Number,
			default: 0,
		},
		image: {
			type: String,
		}
	},
	{timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}}
);


module.exports = mongoose.model('Product', ProductSchema);
