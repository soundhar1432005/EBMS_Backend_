const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const ServiceProvider = require('../models/ServiceProvider')
const upload = require('../middleware/upload')

const router = express.Router()

// Client Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    
    console.log('Client signup attempt for email:', email)
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log('User already exists:', email)
      return res.status(400).json({ error: 'Email already registered' })
    }
    
    console.log('Creating new client user...')
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'client'
    })
    
    await user.save()
    console.log('Client user created successfully:', email)
    
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET)
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role
      } 
    })
  } catch (error) {
    console.error('Client signup error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Provider Register (with file upload)
router.post('/register/provider', upload.single('shop_logo'), async (req, res) => {
  try {
    const { 
      name, email, password, phone,
      business_name, service_type, business_email, contact_number, contact_number_2, contact_number_3,
      shop_location, studio_name, salon_name, specialty
    } = req.body
    
    console.log('Provider signup attempt for email:', email)
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log('User already exists:', email)
      return res.status(400).json({ error: 'Email already registered' })
    }
    
    console.log('Creating new provider user...')
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user account
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'provider',
      isApproved: false // Requires admin approval
    })
    
    await user.save()
    console.log('Provider user created successfully:', email)
    
    // Get logo path if uploaded
    const logoPath = req.file ? `/uploads/logos/${req.file.filename}` : null
    
    // Create service provider profile
    const provider = new ServiceProvider({
      user_id: user._id,
      business_name,
      service_type,
      contact_number,
      contact_number_2,
      contact_number_3,
      email: business_email || email, // Use business email if provided, otherwise user email
      shop_location,
      shop_logo: logoPath,
      studio_name,
      salon_name,
      specialty
    })
    
    await provider.save()
    console.log('Provider profile created successfully')
    
    res.json({ 
      message: 'Registration successful! Please wait for admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    })
  } catch (error) {
    console.error('Provider signup error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Client Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    console.log('Client login attempt for email:', email)
    
    const user = await User.findOne({ email, role: 'client' })
    if (!user) {
      console.log('Client user not found:', email)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    console.log('Client user found, checking password...')
    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
      console.log('Invalid password for:', email)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    console.log('Client login successful for:', email)
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET)
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role
      } 
    })
  } catch (error) {
    console.error('Client login error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Provider Login
router.post('/login/provider', async (req, res) => {
  try {
    const { email, password } = req.body
    
    console.log('Provider login attempt for email:', email)
    
    const user = await User.findOne({ email, role: 'provider' })
    if (!user) {
      console.log('Provider user not found:', email)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    if (!user.isApproved) {
      console.log('Provider not approved yet:', email)
      return res.status(403).json({ error: 'Your account is pending admin approval' })
    }
    
    console.log('Provider user found, checking password...')
    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
      console.log('Invalid password for:', email)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Get provider profile
    const provider = await ServiceProvider.findOne({ user_id: user._id })
    
    console.log('Provider login successful for:', email)
    const token = jwt.sign({ userId: user._id, role: user.role, providerId: provider._id }, process.env.JWT_SECRET)
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role
      },
      provider: {
        id: provider._id,
        business_name: provider.business_name,
        service_type: provider.service_type
      }
    })
  } catch (error) {
    console.error('Provider login error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Admin Login
router.post('/login/admin', async (req, res) => {
  try {
    const { email, password } = req.body
    
    console.log('Admin login attempt for email:', email)
    
    const user = await User.findOne({ email, role: 'admin' })
    if (!user) {
      console.log('Admin user not found:', email)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    console.log('Admin user found, checking password...')
    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
      console.log('Invalid password for:', email)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    console.log('Admin login successful for:', email)
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET)
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
