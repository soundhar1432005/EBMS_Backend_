const express = require('express')
const ServiceProvider = require('../models/ServiceProvider')
const User = require('../models/User')

const router = express.Router()

// Get all approved service providers
router.get('/approved', async (req, res) => {
  try {
    const { service_type } = req.query
    
    // Find all approved users with provider role
    const approvedUsers = await User.find({ 
      role: 'provider', 
      isApproved: true 
    }).select('_id')
    
    const approvedUserIds = approvedUsers.map(user => user._id)
    
    // Build query
    let query = { user_id: { $in: approvedUserIds } }
    
    // Filter by service type if provided
    if (service_type) {
      query.service_type = service_type
    }
    
    // Get provider profiles with user details
    const providers = await ServiceProvider.find(query)
      .populate('user_id', 'name email phone')
      .sort({ createdAt: -1 })
    
    res.json(providers)
  } catch (error) {
    console.error('Error fetching approved providers:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get single provider details
router.get('/:id', async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id)
      .populate('user_id', 'name email phone')
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' })
    }
    
    // Check if provider is approved
    const user = await User.findById(provider.user_id)
    if (!user.isApproved) {
      return res.status(403).json({ error: 'Provider not approved' })
    }
    
    res.json(provider)
  } catch (error) {
    console.error('Error fetching provider:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
