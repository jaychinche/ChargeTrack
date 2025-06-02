const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getBooking,
  deleteBooking
} = require('../controllers/adminBookingController');

// Get all bookings with filters
router.get('/', getAllBookings);

// Get single booking
router.get('/:id', getBooking);

// Delete booking
router.delete('/:id', deleteBooking);

module.exports = router;