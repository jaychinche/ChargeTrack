const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  station: {
    type: mongoose.Schema.ObjectId,
    ref: 'ChargingStation',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  notes: {
    type: String
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Cancelled', 'Completed'],
    default: 'Confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
