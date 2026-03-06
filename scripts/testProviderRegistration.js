const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const User = require('../models/User')
const ServiceProvider = require('../models/ServiceProvider')

async function testRegistration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    // Create a test provider
    const email = 'provider@test.com'
    const password = 'test123'
    
    console.log('\n1. Creating provider user account...')
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = new User({
      name: 'Test Provider',
      email: email,
      password: hashedPassword,
      phone: '1234567890',
      role: 'provider',
      isApproved: true // Approve immediately for testing
    })
    
    await user.save()
    console.log('✓ Provider user created:', email)
    console.log('  - Role:', user.role)
    console.log('  - Approved:', user.isApproved)
    
    console.log('\n2. Creating provider profile...')
    const provider = new ServiceProvider({
      user_id: user._id,
      business_name: 'Test Photography Studio',
      service_type: 'photoshoot',
      contact_number: '1234567890',
      contact_number_2: '0987654321',
      contact_number_3: '1122334455',
      email: 'business@test.com',
      shop_location: 'Test Location',
      studio_name: 'Test Studio',
      specialty: 'Wedding Photography'
    })
    
    await provider.save()
    console.log('✓ Provider profile created')
    console.log('  - Business:', provider.business_name)
    console.log('  - Service:', provider.service_type)
    
    console.log('\n3. Testing login...')
    const loginUser = await User.findOne({ email, role: 'provider' })
    if (!loginUser) {
      console.log('✗ User not found')
      return
    }
    console.log('✓ User found')
    
    const validPassword = await bcrypt.compare(password, loginUser.password)
    console.log('✓ Password valid:', validPassword)
    
    if (!loginUser.isApproved) {
      console.log('✗ User not approved')
      return
    }
    console.log('✓ User approved')
    
    const loginProvider = await ServiceProvider.findOne({ user_id: loginUser._id })
    console.log('✓ Provider profile found:', loginProvider.business_name)
    
    console.log('\n✓ All tests passed!')
    console.log('\nLogin credentials:')
    console.log('  Email:', email)
    console.log('  Password:', password)
    
    await mongoose.connection.close()
  } catch (error) {
    console.error('Test error:', error)
    process.exit(1)
  }
}

testRegistration()
