const mongoose = require("mongoose");

const customerSchema = mongoose.Schema(
	{
		id: {
			type: Number
		},
		name: {
			type: String,
			required: [true, "Please add name"],
		},
		phone: {
			type: String,
			required: [true, "Please add phone"]
		}
	}
)
module.exports = mongoose.model("Customer", customerSchema);
