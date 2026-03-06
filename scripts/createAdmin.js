const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const User = require('../models/User')

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    // Admin credentials
    const email = 'soundhar1432005@gmail.com'
    const password = 'Soundhar@2005'
    const name = 'Soundhar'
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email })
    if (existingAdmin) {
      console.log('❌ Admin with this email already exists!')
      console.log('Email:', existingAdmin.email)
      console.log('Role:', existingAdmin.role)
      await mongoose.connection.close()
      return
    }
    
    console.log('\nCreating admin account...')
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
      isActive: true
    })
    
    await admin.save()
    
    console.log('\n✅ Admin account created successfully!')
    console.log('\n📋 Admin Login Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('Login URL: http://localhost:3000/login/admin')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  IMPORTANT: Change the password after first login!')
    
    await mongoose.connection.close()
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()
