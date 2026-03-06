const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  hall_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FunctionHall'
  },
  booking_type: {
    type: String,
    required: true
  },
  booking_date: {
    type: Date,
    required: true
  },
  booking_time: {
    type: String,
    required: true
  },
  end_time: String,
  event_location: String,
  event_types: [String],
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'cancelled', 'completed']
  },
  number_of_people: Number,
  meal_type: String,
  vehicle_type: String,
  pickup_location: String,
  notes: String,
  total_price: Number
}, {
  timestamps: true
})

module.exports = mongoose.model('Booking', bookingSchema)
