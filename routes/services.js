const express = require('express')
const Service = require('../models/Service')

const router = express.Router()

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ category: 1, name: 1 })
    res.json(services)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get services by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params
    const services = await Service.find({ category })
    res.json(services)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
