const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient_type: {
    type: String,
    enum: ['admin', 'provider', 'client'],
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'cancellation', 'feedback', 'approval', 'reminder'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  is_read: {
    type: Boolean,
    default: false
  },
  sent_via: [{
    type: String,
    enum: ['email', 'sms', 'app']
  }]
}, {
  timestamps: true
})

module.exports = mongoose.model('Notification', notificationSchema)
