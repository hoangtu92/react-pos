const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
	{
		sku: {
			type: String
		},
		barcode: {
			type: String
		},
		categories: [],
		name: {
			type: String,
			trim: true,
			required: [true, 'Please provide product name'],
		},
		price: {
			type: Number,
			required: [true, 'Please provide product price'],
			default: 0,
		},
		image: {
			type: String,
		}
	},
	{timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}}
);


module.exports = mongoose.model('Product', ProductSchema);
