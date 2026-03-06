const express = require('express')
const ServiceProvider = require('../models/ServiceProvider')
const Booking = require('../models/Booking')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

// Get provider stats
router.get('/stats/:providerId', authenticateToken, async (req, res) => {
  try {
    const { providerId } = req.params
    
    const totalBookings = await Booking.countDocuments({ provider_id: providerId })
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const upcomingEvents = await Booking.countDocuments({
      provider_id: providerId,
      booking_date: { $gte: today },
      status: { $in: ['pending', 'confirmed'] }
    })
    
    const completedEvents = await Booking.countDocuments({
      provider_id: providerId,
      status: 'completed'
    })
    
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          provider_id: providerId,
          status: { $in: ['confirmed', 'completed'] }
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
    console.error('Error fetching provider stats:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get provider bookings
router.get('/bookings/:providerId', authenticateToken, async (req, res) => {
  try {
    const { providerId } = req.params
    const { status } = req.query
    
    let query = { provider_id: providerId }
    
    if (status === 'upcoming') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      query.booking_date = { $gte: today }
      query.status = { $in: ['pending', 'confirmed'] }
    } else if (status) {
      query.status = status
    }
    
    const bookings = await Booking.find(query)
      .sort({ booking_date: 1, booking_time: 1 })
      .limit(10)
    
    res.json(bookings)
  } catch (error) {
    console.error('Error fetching provider bookings:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get provider profile
router.get('/profile/:providerId', authenticateToken, async (req, res) => {
  try {
    const { providerId } = req.params
    
    const provider = await ServiceProvider.findById(providerId)
      .populate('user_id', 'name email phone')
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' })
    }
    
    res.json(provider)
  } catch (error) {
    console.error('Error fetching provider profile:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update provider profile
router.put('/profile/:providerId', authenticateToken, async (req, res) => {
  try {
    const { providerId } = req.params
    const updates = req.body
    
    const provider = await ServiceProvider.findByIdAndUpdate(
      providerId,
      updates,
      { new: true, runValidators: true }
    )
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' })
    }
    
    res.json(provider)
  } catch (error) {
    console.error('Error updating provider profile:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update booking status
router.patch('/bookings/:bookingId/status', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params
    const { status } = req.body
    
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    )
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    
    res.json(booking)
  } catch (error) {
    console.error('Error updating booking status:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
