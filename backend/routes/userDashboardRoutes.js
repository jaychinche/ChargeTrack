const express = require('express');
const router = express.Router();
const {
  createBooking
} = require('../controllers/userDashboardController');

// Create a new booking
router.post('/', createBooking);

module.exports = router;