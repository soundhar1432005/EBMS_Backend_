const mongoose = require('mongoose')

const serviceProviderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business_name: {
    type: String,
    required: true
  },
  service_type: {
    type: String,
    required: true,
    enum: ['photoshoot', 'bridal-makeup', 'catering', 'cab-bookings']
  },
  contact_number: {
    type: String,
    required: true
  },
  contact_number_2: String,
  contact_number_3: String,
  email: {
    type: String,
    required: true
  },
  shop_location: String,
  shop_logo: String,
  studio_name: String,
  salon_name: String,
  specialty: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_reviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema)
