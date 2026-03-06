const mongoose = require('mongoose')

const functionHallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  amenities: [String],
  image_url: String
}, {
  timestamps: true
})

module.exports = mongoose.model('FunctionHall', functionHallSchema)
