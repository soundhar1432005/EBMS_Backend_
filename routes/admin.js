const express = require('express')
const User = require('../models/User')
const ServiceProvider = require('../models/ServiceProvider')
const Booking = require('../models/Booking')
const Feedback = require('../models/Feedback')
const Notification = require('../models/Notification')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' })
  }
  next()
}

// Get all pending providers
router.get('/providers/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const pendingProviders = await User.find({ 
      role: 'provider', 
      isApproved: false 
    }).select('-password')
    
    // Get provider details for each user
    const providersWithDetails = await Promise.all(
      pendingProviders.map(async (user) => {
        const provider = await ServiceProvider.findOne({ user_id: user._id })
        return {
          user,
          provider
        }
      })
    )
    
    res.json(providersWithDetails)
  } catch (error) {
    console.error('Error fetching pending providers:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all providers (approved and pending)
router.get('/providers', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query
    
    let query = { role: 'provider' }
    if (status === 'approved') {
      query.isApproved = true
    } else if (status === 'pending') {
      query.isApproved = false
    }
    
    const users = await User.find(query).select('-password')
    
    const providersWithDetails = await Promise.all(
      users.map(async (user) => {
        const provider = await ServiceProvider.findOne({ user_id: user._id })
        return {
          user,
          provider
        }
      })
    )
    
    res.json(providersWithDetails)
  } catch (error) {
    console.error('Error fetching providers:', error)
    res.status(500).json({ error: error.message })
  }
})

// Approve provider
router.patch('/providers/:userId/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    if (user.role !== 'provider') {
      return res.status(400).json({ error: 'User is not a provider' })
    }
    
    user.isApproved = true
    await user.save()
    
    res.json({ 
      message: 'Provider approved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved
      }
    })
  } catch (error) {
    console.error('Error approving provider:', error)
    res.status(500).json({ error: error.message })
  }
})

// Reject/Deactivate provider
router.patch('/providers/:userId/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    user.isApproved = false
    user.isActive = false
    await user.save()
    
    res.json({ 
      message: 'Provider rejected/deactivated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
        isActive: user.isActive
      }
    })
  } catch (error) {
    console.error('Error rejecting provider:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get dashboard stats
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalClients = await User.countDocuments({ role: 'client' })
    const totalProviders = await User.countDocuments({ role: 'provider', isApproved: true })
    const pendingProviders = await User.countDocuments({ role: 'provider', isApproved: false })
    const totalBookings = await Booking.countDocuments()
    
    res.json({
      totalClients,
      totalProviders,
      pendingProviders,
      totalBookings
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all bookings
router.get('/bookings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query
    
    let query = {}
    if (status) {
      query.status = status
    }
    
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
    
    res.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get calendar events (all bookings for calendar view)
router.get('/calendar/events', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { month, year } = req.query
    
    let query = {}
    if (month && year) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)
      query.booking_date = { $gte: startDate, $lte: endDate }
    }
    
    const bookings = await Booking.find(query)
      .populate('provider_id', 'business_name service_type')
      .sort({ booking_date: 1 })
    
    res.json(bookings)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all feedback
router.get('/feedback', authenticateToken, isAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('client_id', 'name email')
      .populate('provider_id', 'business_name service_type')
      .populate('booking_id')
      .sort({ createdAt: -1 })
      .limit(100)
    
    res.json(feedback)
  } catch (error) {
    console.error('Error fetching feedback:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all clients
router.get('/clients', authenticateToken, isAdmin, async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' })
      .select('-password')
      .sort({ createdAt: -1 })
    
    // Get booking count for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const bookingCount = await Booking.countDocuments({ client_id: client._id })
        return {
          ...client.toObject(),
          bookingCount
        }
      })
    )
    
    res.json(clientsWithStats)
  } catch (error) {
    console.error('Error fetching clients:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get provider tracking/analytics
router.get('/providers/:providerId/analytics', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { providerId } = req.params
    
    const provider = await ServiceProvider.findById(providerId)
      .populate('user_id', 'name email phone')
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' })
    }
    
    const totalBookings = await Booking.countDocuments({ provider_id: providerId })
    const completedBookings = await Booking.countDocuments({ 
      provider_id: providerId, 
      status: 'completed' 
    })
    const pendingBookings = await Booking.countDocuments({ 
      provider_id: providerId, 
      status: 'pending' 
    })
    const cancelledBookings = await Booking.countDocuments({ 
      provider_id: providerId, 
      status: 'cancelled' 
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
    
    const avgRating = await Feedback.aggregate([
      { $match: { provider_id: providerId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ])
    
    const feedbackCount = await Feedback.countDocuments({ provider_id: providerId })
    
    res.json({
      provider,
      stats: {
        totalBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        averageRating: avgRating.length > 0 ? avgRating[0].avgRating : 0,
        feedbackCount
      }
    })
  } catch (error) {
    console.error('Error fetching provider analytics:', error)
    res.status(500).json({ error: error.message })
  }
})

// Toggle provider active status
router.patch('/providers/:userId/toggle-status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    user.isActive = !user.isActive
    await user.save()
    
    res.json({ 
      message: `Provider ${user.isActive ? 'activated' : 'deactivated'}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    })
  } catch (error) {
    console.error('Error toggling provider status:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete user (client or provider)
router.delete('/users/:userId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // If provider, delete provider profile too
    if (user.role === 'provider') {
      await ServiceProvider.deleteOne({ user_id: userId })
    }
    
    await User.deleteOne({ _id: userId })
    
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get notifications
router.get('/notifications', authenticateToken, isAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
    
    res.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create notification
router.post('/notifications', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { user_id, message, type } = req.body
    
    const notification = new Notification({
      user_id,
      message,
      type: type || 'info'
    })
    
    await notification.save()
    
    res.json({ message: 'Notification created', notification })
  } catch (error) {
    console.error('Error creating notification:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get recent activities (for dashboard)
router.get('/activities', authenticateToken, isAdmin, async (req, res) => {
  try {
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('service_type booking_date status createdAt')
    
    const recentProviders = await User.find({ role: 'provider' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt isApproved')
    
    const recentFeedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client_id', 'name')
      .populate('provider_id', 'business_name')
    
    res.json({
      recentBookings,
      recentProviders,
      recentFeedback
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
