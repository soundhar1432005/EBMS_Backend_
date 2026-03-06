const express = require('express')
const FunctionHall = require('../models/FunctionHall')
const Booking = require('../models/Booking')

const router = express.Router()

// Get all function halls
router.get('/', async (req, res) => {
  try {
    const halls = await FunctionHall.find().sort({ capacity: -1 })
    res.json(halls)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get available halls for specific date and time
router.get('/available', async (req, res) => {
  try {
    const { date, time } = req.query
    
    if (!date || !time) {
      return res.status(400).json({ error: 'Date and time are required' })
    }
    
    const bookedHalls = await Booking.find({
      booking_date: new Date(date),
      booking_time: time,
      status: { $ne: 'cancelled' }
    }).distinct('hall_id')
    
    const availableHalls = await FunctionHall.find({
      _id: { $nin: bookedHalls.filter(id => id !== null) }
    }).sort({ capacity: -1 })
    
    res.json(availableHalls)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
