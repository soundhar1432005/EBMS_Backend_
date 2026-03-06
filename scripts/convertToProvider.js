const mongoose = require('mongoose')
require('dotenv').config()

const User = require('../models/User')

async function convertToProvider(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    const user = await User.findOne({ email })
    
    if (!user) {
      console.log('User not found:', email)
      await mongoose.connection.close()
      return
    }
    
    console.log('Current user details:')
    console.log('  - Email:', user.email)
    console.log('  - Role:', user.role)
    console.log('  - Approved:', user.isApproved)
    
    // Update to provider
    user.role = 'provider'
    user.isApproved = true
    await user.save()
    
    console.log('\nUpdated user details:')
    console.log('  - Email:', user.email)
    console.log('  - Role:', user.role)
    console.log('  - Approved:', user.isApproved)
    console.log('\n✓ User converted to provider successfully!')
    
    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

const email = process.argv[2]
if (!email) {
  console.log('Usage: node convertToProvider.js <email>')
  process.exit(1)
}

convertToProvider(email)
