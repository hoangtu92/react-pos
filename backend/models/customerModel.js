const mongoose = require("mongoose");

const customerSchema = mongoose.Schema(
	{
		user_id: {
			type: Number
		},
		avatar: {
			type: String,
		},
		name: {
			type: String
		},
		phone: {
			type: String,
			required: [true, "Please add phone"],
			unique: true
		},
		email: {
			type: String
		},
		buyer_id: {
			type: String
		},
		carrier_id: {
			type: String
		},
		points: {
			type: Number,
			default: 0
		}
	}
)
module.exports = mongoose.model("Customer", customerSchema);
