const mongoose = require('mongoose')
const dotenv = require('dotenv')
const ServiceProvider = require('../models/ServiceProvider')
const FunctionHall = require('../models/FunctionHall')
const Service = require('../models/Service')

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booking_platform')
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

const seedDatabase = async () => {
  try {
    await connectDB()

    // Clear existing data
    await ServiceProvider.deleteMany({})
    await FunctionHall.deleteMany({})
    await Service.deleteMany({})

    console.log('Cleared existing data')

    // Insert sample service providers - Photography (6 providers)
    const photographyProviders = await ServiceProvider.create([
      {
        name: 'Studio Vision Photography',
        category: 'photoshoot',
        contact_number: '+1-555-0101',
        contact_number_2: '+1-555-0102',
        contact_number_3: '+1-555-0103',
        studio_name: 'Downtown Studio',
        rating: 4.8
      },
      {
        name: 'Perfect Moments Studio',
        category: 'photoshoot',
        contact_number: '+1-555-0104',
        contact_number_2: '+1-555-0105',
        contact_number_3: '+1-555-0106',
        studio_name: 'Uptown Gallery',
        rating: 4.9
      },
      {
        name: 'Elite Photography Services',
        category: 'photoshoot',
        contact_number: '+1-555-0107',
        contact_number_2: '+1-555-0108',
        contact_number_3: '+1-555-0109',
        studio_name: 'Westside Studio',
        rating: 4.7
      },
      {
        name: 'Capture Memories Studio',
        category: 'photoshoot',
        contact_number: '+1-555-0110',
        contact_number_2: '+1-555-0111',
        contact_number_3: '+1-555-0112',
        studio_name: 'Eastside Gallery',
        rating: 4.6
      },
      {
        name: 'Artistic Lens Photography',
        category: 'photoshoot',
        contact_number: '+1-555-0113',
        contact_number_2: '+1-555-0114',
        contact_number_3: '+1-555-0115',
        studio_name: 'Central Studio',
        rating: 4.8
      },
      {
        name: 'Timeless Shots Studio',
        category: 'photoshoot',
        contact_number: '+1-555-0116',
        contact_number_2: '+1-555-0117',
        contact_number_3: '+1-555-0118',
        studio_name: 'Northside Studio',
        rating: 4.9
      }
    ])

    // Bridal Makeup (6 providers)
    const makeupProviders = await ServiceProvider.create([
      {
        name: 'Glamour Beauty Salon',
        category: 'bridal-makeup',
        contact_number: '+1-555-0201',
        contact_number_2: '+1-555-0202',
        contact_number_3: '+1-555-0203',
        salon_name: 'Beauty Plaza',
        rating: 4.9
      },
      {
        name: 'Bridal Elegance Studio',
        category: 'bridal-makeup',
        contact_number: '+1-555-0204',
        contact_number_2: '+1-555-0205',
        contact_number_3: '+1-555-0206',
        salon_name: 'Luxury Salon',
        rating: 4.8
      },
      {
        name: 'Royal Makeup Artists',
        category: 'bridal-makeup',
        contact_number: '+1-555-0207',
        contact_number_2: '+1-555-0208',
        contact_number_3: '+1-555-0209',
        salon_name: 'Royal Beauty Center',
        rating: 4.7
      },
      {
        name: 'Divine Beauty Studio',
        category: 'bridal-makeup',
        contact_number: '+1-555-0210',
        contact_number_2: '+1-555-0211',
        contact_number_3: '+1-555-0212',
        salon_name: 'Divine Salon',
        rating: 4.8
      },
      {
        name: 'Radiant Bridal Makeup',
        category: 'bridal-makeup',
        contact_number: '+1-555-0213',
        contact_number_2: '+1-555-0214',
        contact_number_3: '+1-555-0215',
        salon_name: 'Radiant Beauty',
        rating: 4.9
      },
      {
        name: 'Elegant Touch Makeup',
        category: 'bridal-makeup',
        contact_number: '+1-555-0216',
        contact_number_2: '+1-555-0217',
        contact_number_3: '+1-555-0218',
        salon_name: 'Elegant Salon',
        rating: 4.6
      }
    ])

    // Catering (6 providers)
    const cateringProviders = await ServiceProvider.create([
      {
        name: 'Gourmet Catering Co.',
        category: 'catering',
        contact_number: '+1-555-0301',
        contact_number_2: '+1-555-0302',
        contact_number_3: '+1-555-0303',
        specialty: 'Multi-cuisine',
        rating: 4.8
      },
      {
        name: 'Royal Feast Caterers',
        category: 'catering',
        contact_number: '+1-555-0304',
        contact_number_2: '+1-555-0305',
        contact_number_3: '+1-555-0306',
        specialty: 'Traditional & Modern',
        rating: 4.9
      },
      {
        name: 'Premium Events Catering',
        category: 'catering',
        contact_number: '+1-555-0307',
        contact_number_2: '+1-555-0308',
        contact_number_3: '+1-555-0309',
        specialty: 'International Cuisine',
        rating: 4.7
      },
      {
        name: 'Delicious Delights Catering',
        category: 'catering',
        contact_number: '+1-555-0310',
        contact_number_2: '+1-555-0311',
        contact_number_3: '+1-555-0312',
        specialty: 'Fusion Cuisine',
        rating: 4.8
      },
      {
        name: 'Taste of Heaven Caterers',
        category: 'catering',
        contact_number: '+1-555-0313',
        contact_number_2: '+1-555-0314',
        contact_number_3: '+1-555-0315',
        specialty: 'Continental & Asian',
        rating: 4.9
      },
      {
        name: 'Grand Banquet Catering',
        category: 'catering',
        contact_number: '+1-555-0316',
        contact_number_2: '+1-555-0317',
        contact_number_3: '+1-555-0318',
        specialty: 'All Cuisines',
        rating: 4.7
      }
    ])

    // Cab Services (6 providers)
    const cabProviders = await ServiceProvider.create([
      {
        name: 'Premium Cab Services',
        category: 'cab-bookings',
        contact_number: '+1-555-0401',
        contact_number_2: '+1-555-0402',
        contact_number_3: '+1-555-0403',
        specialty: 'Luxury Vehicles',
        rating: 4.8
      },
      {
        name: 'Royal Ride Cabs',
        category: 'cab-bookings',
        contact_number: '+1-555-0404',
        contact_number_2: '+1-555-0405',
        contact_number_3: '+1-555-0406',
        specialty: 'Wedding Cars',
        rating: 4.9
      },
      {
        name: 'Elite Transport Services',
        category: 'cab-bookings',
        contact_number: '+1-555-0407',
        contact_number_2: '+1-555-0408',
        contact_number_3: '+1-555-0409',
        specialty: 'Event Transportation',
        rating: 4.7
      },
      {
        name: 'Comfort Cab Company',
        category: 'cab-bookings',
        contact_number: '+1-555-0410',
        contact_number_2: '+1-555-0411',
        contact_number_3: '+1-555-0412',
        specialty: 'All Vehicle Types',
        rating: 4.6
      },
      {
        name: 'Luxury Wheels Services',
        category: 'cab-bookings',
        contact_number: '+1-555-0413',
        contact_number_2: '+1-555-0414',
        contact_number_3: '+1-555-0415',
        specialty: 'Premium Cars',
        rating: 4.8
      },
      {
        name: 'Swift Ride Cabs',
        category: 'cab-bookings',
        contact_number: '+1-555-0416',
        contact_number_2: '+1-555-0417',
        contact_number_3: '+1-555-0418',
        specialty: 'Quick Service',
        rating: 4.7
      }
    ])

    console.log('Service providers seeded successfully')

    // Insert sample function halls
    const halls = await FunctionHall.create([
      {
        name: 'Grand Ballroom',
        capacity: 500,
        price: 2500.00,
        amenities: ['Stage', 'Sound System', 'AC', 'Parking'],
        image_url: 'https://images.unsplash.com/photo-1519167758481-83f29da8c2b0'
      },
      {
        name: 'Crystal Hall',
        capacity: 300,
        price: 1800.00,
        amenities: ['Projector', 'AC', 'Catering Area', 'Parking'],
        image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'
      },
      {
        name: 'Royal Banquet',
        capacity: 400,
        price: 2200.00,
        amenities: ['Stage', 'Dance Floor', 'AC', 'VIP Lounge'],
        image_url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330'
      },
      {
        name: 'Garden Pavilion',
        capacity: 200,
        price: 1500.00,
        amenities: ['Outdoor Setup', 'Garden View', 'Lighting', 'Parking'],
        image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622'
      }
    ])

    console.log('Function halls seeded successfully')

    // Insert sample services
    const services = await Service.create([
      {
        name: 'Wedding Photoshoot',
        category: 'photoshoot',
        description: 'Professional wedding photography',
        price: 1500.00,
        duration: 480
      },
      {
        name: 'Portrait Session',
        category: 'photoshoot',
        description: 'Individual or family portraits',
        price: 300.00,
        duration: 120
      },
      {
        name: 'Bridal Makeup Package',
        category: 'bridal-makeup',
        description: 'Complete bridal makeup package',
        price: 500.00,
        duration: 180
      },
      {
        name: 'Engagement Makeup',
        category: 'bridal-makeup',
        description: 'Makeup for engagement ceremony',
        price: 300.00,
        duration: 120
      },
      {
        name: 'Wedding Catering',
        category: 'catering',
        description: 'Full wedding catering service',
        price: 5000.00,
        duration: 360
      },
      {
        name: 'Party Catering',
        category: 'catering',
        description: 'Catering for parties and events',
        price: 2000.00,
        duration: 240
      },
      {
        name: '4-Seater Cab',
        category: 'cab-bookings',
        description: 'Standard 4-seater vehicle',
        price: 50.00,
        duration: 60
      },
      {
        name: 'Luxury Vehicle',
        category: 'cab-bookings',
        description: 'Premium luxury car service',
        price: 150.00,
        duration: 60
      }
    ])

    console.log('Services seeded successfully')
    console.log('Database seeded successfully!')
    
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
