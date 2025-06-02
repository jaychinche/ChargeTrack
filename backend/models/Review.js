const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per station
ReviewSchema.index({ user: 1, station: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);