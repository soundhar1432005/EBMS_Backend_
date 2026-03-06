const express = require('express')
const Booking = require('../models/Booking')
const Service = require('../models/Service')
const ServiceProvider = require('../models/ServiceProvider')
const FunctionHall = require('../models/FunctionHall')
const Client = require('../models/Client')
const Reminder = require('../models/Reminder')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

// Get all bookings for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.user.userId })
      .populate('service_id', 'name')
      .populate('provider_id', 'name')
      .populate('hall_id', 'name')
      .sort({ booking_date: -1, booking_time: -1 })
    
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get booking statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ user_id: req.user.userId })
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const upcomingEvents = await Booking.countDocuments({
      user_id: req.user.userId,
      booking_date: { $gte: today },
      status: { $ne: 'cancelled' }
    })
    
    const completedEvents = await Booking.countDocuments({
      user_id: req.user.userId,
      booking_date: { $lt: today }
    })
    
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          user_id: req.user.userId,
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total_price' }
        }
      }
    ])
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    res.json({
      totalBookings,
      upcomingEvents,
      completedEvents,
      totalRevenue
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Check availability for function halls
router.post('/check-availability', async (req, res) => {
  try {
    const { date, time } = req.body
    
    const bookedHalls = await Booking.find({
      booking_date: new Date(date),
      booking_time: time,
      status: { $ne: 'cancelled' }
    }).distinct('hall_id')
    
    const availableHalls = await FunctionHall.find({
      _id: { $nin: bookedHalls }
    })
    
    res.json(availableHalls)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      service_id,
      provider_id,
      hall_id,
      booking_type,
      booking_date,
      booking_time,
      end_time,
      event_location,
      event_types,
      number_of_people,
      meal_type,
      vehicle_type,
      pickup_location,
      notes,
      total_price,
      client_name,
      client_email,
      client_phone
    } = req.body
    
    // Create booking
    const booking = new Booking({
      user_id: req.user.userId,
      service_id,
      provider_id,
      hall_id,
      booking_type,
      booking_date,
      booking_time,
      end_time,
      event_location,
      event_types,
      number_of_people,
      meal_type,
      vehicle_type,
      pickup_location,
      notes,
      total_price
    })
    
    await booking.save()
    
    // Create client record
    const client = new Client({
      user_id: req.user.userId,
      booking_id: booking._id,
      name: client_name,
      email: client_email,
      phone: client_phone
    })
    
    await client.save()
    
    // Create automated reminders (1 day before and 1 hour before)
    const bookingDateTime = new Date(`${booking_date} ${booking_time}`)
    const oneDayBefore = new Date(bookingDateTime.getTime() - 24 * 60 * 60 * 1000)
    const oneHourBefore = new Date(bookingDateTime.getTime() - 60 * 60 * 1000)
    
    await Reminder.create([
      {
        booking_id: booking._id,
        reminder_type: 'email',
        reminder_date: oneDayBefore
      },
      {
        booking_id: booking._id,
        reminder_type: 'sms',
        reminder_date: oneHourBefore
      }
    ])
    
    res.json(booking)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update booking status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    const booking = await Booking.findOneAndUpdate(
      { _id: id, user_id: req.user.userId },
      { status },
      { new: true }
    )
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    
    res.json(booking)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
