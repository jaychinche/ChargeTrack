const mongoose = require('mongoose');

const ChargingStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere',
    },
  },
  city: {
    type: String,
    required: [true, 'Please add a city'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance'],
    default: 'Active',
  },
  powerOutput: {
    type: Number,
    required: [true, 'Please add power output in kW'],
    min: [1, 'Power output must be at least 1kW'],
  },
  connectorType: {
    type: String,
    required: [true, 'Please add connector type'],
    enum: [
      'Type 1 (J1772)',
      'Type 2 (Mennekes)',
      'CCS (Combo 1)',
      'CCS (Combo 2)',
      'CHAdeMO',
      'Tesla',
      'GB/T',
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  
});

// Create location as GeoJSON point
ChargingStationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ChargingStation', ChargingStationSchema);