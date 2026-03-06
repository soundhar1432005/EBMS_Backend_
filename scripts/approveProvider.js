const mongoose = require('mongoose')
const dotenv = require('dotenv')
const User = require('../models/User')

dotenv.config()

const approveProvider = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_booking')
    console.log('MongoDB connected')

    const user = await User.findOne({ email, role: 'provider' })
    
    if (!user) {
      console.log('Provider not found with email:', email)
      process.exit(1)
    }

    if (user.isApproved) {
      console.log('Provider is already approved!')
      process.exit(0)
    }

    user.isApproved = true
    await user.save()

    console.log('✅ Provider approved successfully!')
    console.log('Name:', user.name)
    console.log('Email:', user.email)
    console.log('They can now login at /login/provider')

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: node approveProvider.js <provider-email>')
  console.log('Example: node approveProvider.js provider@example.com')
  process.exit(1)
}

approveProvider(email)
