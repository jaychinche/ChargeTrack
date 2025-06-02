const ChargingStation = require('../models/ChargingStation');
const User = require('../models/User');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

// Helper function to verify user token
const verifyUser = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.id; // Return user ID
};
// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const userId = await verifyUser(req.headers.authorization);

    const booking = new Booking({
      station: req.body.stationId,
      user: userId,
      timeSlot: req.body.time,
      date: req.body.date,
      duration: req.body.duration,
      vehicleNumber: req.body.vehicleNumber,
      notes: req.body.notes
    });

    const savedBooking = await booking.save();
    
    res.status(201).json({
      success: true,
      data: savedBooking,
      message: 'Booking created successfully'
    });

  } catch (err) {
    console.error('Booking creation error:', err);
    
    if (err.message === 'No token provided') {
      return res.status(401).json({ success: false, message: err.message });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating booking',
      error: err.message 
    });
  }
};