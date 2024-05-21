const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
	{
		sku: {
			type: String
		},
		barcode: {
			type: String
		},
		product_id: {
			type: Number
		},
		parent_id:{
			type: Number
		},
		categories: [],
		tags: [],
		brands: [],
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
