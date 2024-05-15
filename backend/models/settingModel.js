const mongoose = require('mongoose')

const settingSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    value: {
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Setting', settingSchema)
