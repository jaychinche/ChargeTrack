const Booking = require('../models/Booking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const verifyAdmin = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized access');
  }
  return user;
};
// Get all bookings with filters
exports.getAllBookings = async (req, res) => {
  try {
    await verifyAdmin(req.headers.authorization);

    // Extract query parameters
    const { 
      search = '', 
      status = 'all', 
      startDate = '', 
      endDate = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build query
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'station.name': { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) };
    }

    // Count total documents
    const total = await Booking.countDocuments(query);

    // Get paginated bookings
    const bookings = await Booking.find(query)
      .populate({
        path: 'user',
        select: 'name email avatar'
      })
      .populate({
        path: 'station',
        select: 'name location.address image'
      })
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      bookings: bookings.map(booking => ({
        ...booking.toObject(),
        startTime: booking.date,
        endTime: new Date(new Date(booking.date).getTime() + booking.duration * 60 * 60 * 1000),
        totalPrice: booking.duration * 10
      }))
    });

  } catch (err) {
    console.error('Error fetching admin bookings:', err);
    
    if (err.message === 'No token provided') {
      return res.status(401).json({ success: false, message: err.message });
    }
    if (err.message === 'Unauthorized access') {
      return res.status(403).json({ success: false, message: err.message });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching bookings',
      error: err.message 
    });
  }
};
// Get single booking
exports.getBooking = async (req, res) => {
  try {
    await verifyAdmin(req.headers.authorization);

    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email avatar'
      })
      .populate({
        path: 'station',
        select: 'name location.address image'
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      booking: {
        ...booking.toObject(),
        startTime: booking.date,
        endTime: new Date(new Date(booking.date).getTime() + booking.duration * 60 * 60 * 1000),
        totalPrice: booking.duration * 10,
        vehicle: {
          model: 'Unknown',
          plateNumber: booking.vehicleNumber
        },
        payment: {
          method: 'Credit Card',
          status: booking.status === 'Confirmed' ? 'completed' : 'pending'
        }
      }
    });

  } catch (err) {
    console.error('Error fetching booking:', err);
    
    if (err.message === 'No token provided') {
      return res.status(401).json({ success: false, message: err.message });
    }
    if (err.message === 'Unauthorized access') {
      return res.status(403).json({ success: false, message: err.message });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching booking',
      error: err.message 
    });
  }
};
// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    await verifyAdmin(req.headers.authorization);

    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Booking deleted successfully' 
    });

  } catch (err) {
    console.error('Error deleting booking:', err);
    
    if (err.message === 'No token provided') {
      return res.status(401).json({ success: false, message: err.message });
    }
    if (err.message === 'Unauthorized access') {
      return res.status(403).json({ success: false, message: err.message });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting booking',
      error: err.message 
    });
  }
};