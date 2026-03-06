const mongoose = require('mongoose')
require('dotenv').config()

const User = require('../models/User')
const ServiceProvider = require('../models/ServiceProvider')

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    // Delete all users and providers
    const deletedUsers = await User.deleteMany({})
    const deletedProviders = await ServiceProvider.deleteMany({})
    
    console.log(`Deleted ${deletedUsers.deletedCount} users`)
    console.log(`Deleted ${deletedProviders.deletedCount} providers`)
    console.log('Database cleaned successfully')
    
    await mongoose.connection.close()
  } catch (error) {
    console.error('Cleanup error:', error)
    process.exit(1)
  }
}

cleanup()
