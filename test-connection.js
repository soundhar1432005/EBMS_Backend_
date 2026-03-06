const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...')
    console.log('Connection URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/booking_platform')
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booking_platform')
    
    console.log('✅ MongoDB connected successfully!')
    console.log('Database:', mongoose.connection.name)
    console.log('Host:', mongoose.connection.host)
    console.log('Port:', mongoose.connection.port)
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('\nCollections in database:')
    if (collections.length === 0) {
      console.log('  No collections found. Run "npm run seed" to populate the database.')
    } else {
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments()
        console.log(`  - ${collection.name}: ${count} documents`)
      }
    }
    
    await mongoose.connection.close()
    console.log('\n✅ Connection test completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ MongoDB connection failed!')
    console.error('Error:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Make sure MongoDB is installed and running')
    console.log('2. Check if mongosh connects: mongosh')
    console.log('3. Verify .env file exists with MONGODB_URI')
    console.log('4. See INSTALL_MONGODB.md for installation instructions')
    process.exit(1)
  }
}

testConnection()
