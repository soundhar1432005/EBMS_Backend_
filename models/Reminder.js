const mongoose = require('mongoose')

const reminderSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  reminder_type: {
    type: String,
    required: true
  },
  reminder_date: {
    type: Date,
    required: true
  },
  sent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Reminder', reminderSchema)
