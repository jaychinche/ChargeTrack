const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const ChargingStation = require('./models/ChargingStation');
const User = require('./models/User');
const Booking = require('../backend/models/Booking');
require('dotenv').config();
connectDB(); 
const auth = require('./routes/authRoutes');
const chargingStations = require('./routes/chargingStationRoutes');
const adminBookingRoutes = require('./routes/adminBookingRoutes');
const userDashboardRoutes = require('./routes/userDashboardRoutes');
const app = express();
app.use(express.json());

app.use(cors({
  origin: "https://charge-track.vercel.app",
  credentials: true,  
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization",'x-auth-token']
  
}));

app.use('/api/v1/auth', auth);
app.use('/api/v1/charging-stations', chargingStations);
app.use('/admin/bookings', adminBookingRoutes);

app.use('/user-dashboard/bookings', userDashboardRoutes);
app.get("/user-dashboard", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const activeChargers = await ChargingStation.countDocuments({ status: "Active" });

    const userCoordinates = [77.5946, 12.9716]; // Example coords

    const nearbyChargerDocs = await ChargingStation.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: userCoordinates,
          },
          $maxDistance: 10000,
        },
      },
    });
    const nearbyChargers = nearbyChargerDocs.length;

    const chargers = await ChargingStation.find({ status: "Active" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name connectorType powerOutput");

    const user = await User.findById(userId).select("username");

    res.json({
      username: user.username,
      activeChargers,
      nearbyChargers,
      chargers,
    });
  } catch (err) {
    console.error("Error in /user-dashboard:", err);
    res.status(500).json({ message: "Server Error" });
  }
});
app.post('/user-dashboard/bookings', async (req, res) => {
  try {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    // Extract the authorization token from headers
  
    console.log('Decoded user ID:', userId);

    // Create booking with all required fields
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
    res.status(201).json(savedBooking);
  } catch (err) {
    console.error(err);
    
    if (err.name === 'ValidationError') {
      // Handle validation errors specifically
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ error: 'Server error while booking' });
  }
});
const PORT = process.env.PORT || 9000;
app.listen(PORT,() => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

