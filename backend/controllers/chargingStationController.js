const { verifyToken, verifyAdmin } = require('../utils/authUtils');
const ChargingStation = require('../models/ChargingStation');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const User = require('../models/User');

exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Extract token from header
    let user = null;
    try {
      const decoded = await verifyToken(req.headers.authorization);
      user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      user = null; // invalid token or error
    }

    // 2. Fetch stats
    const [totalChargers, activeChargers, inactiveChargers, totalUsers] = await Promise.all([
      ChargingStation.countDocuments(),
      ChargingStation.countDocuments({ status: 'Active' }),
      ChargingStation.countDocuments({ status: { $in: ['Inactive', 'Maintenance'] } }),
      User.countDocuments(),
    ]);

    // 3. Prepare user object for response
    const userInfo = user
      ? {
          username: user.username,
          role: user.role,
          email: user.email,
        }
      : null;

    // 4. Send response
    res.status(200).json({
      success: true,
      data: {
        user: userInfo,
        stats: {
          totalChargers,
          activeChargers,
          inactiveChargers,
          totalUsers,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getChargingStations = async (req, res, next) => {
  try {
    // Extract query parameters
    const { status, powerOutput, connectorType, name, sort, page = 1, limit = 10 } = req.query;
    
    // Build query object
    const query = {};
    
    if (status) query.status = status;
    if (powerOutput) query.powerOutput = powerOutput;
    if (connectorType) query.connectorType = connectorType;
    if (name) query.name = { $regex: name, $options: 'i' };
    
    // Parse sort
    let sortOption = '-createdAt';
    if (sort) {
      sortOption = sort.startsWith('-') 
        ? { [sort.substring(1)]: -1 } 
        : { [sort]: 1 };
    }
    
    // Pagination
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;
    
    const total = await ChargingStation.countDocuments(query);
    const chargingStations = await ChargingStation.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitInt)
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      count: chargingStations.length,
      total,
      data: chargingStations
    });
    
  } catch (err) {
    next(err);
  }
};

exports.getChargingStation = async (req, res, next) => {
  try {
    const chargingStation = await ChargingStation.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!chargingStation) {
      return next(new ErrorResponse(`Charging station not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: chargingStation
    });
  } catch (err) {
    next(err);
  }
};

exports.createChargingStation = async (req, res, next) => {
  try {
    // Verify admin
    const user = await verifyAdmin(req.headers.authorization);

    // 2. Parse latitude and longitude
    let latitude, longitude;

    // Accepting either latitude/longitude OR location.coordinates
    if ('latitude' in req.body && 'longitude' in req.body) {
      latitude = parseFloat(req.body.latitude);
      longitude = parseFloat(req.body.longitude);
    } else if (
      req.body.location &&
      req.body.location.type === 'Point' &&
      Array.isArray(req.body.location.coordinates)
    ) {
      [longitude, latitude] = req.body.location.coordinates.map(parseFloat);
    } else {
      return next(new ErrorResponse('Latitude and Longitude are required', 400));
    }

    // 3. Validate numbers
    if (isNaN(latitude) || isNaN(longitude)) {
      return next(new ErrorResponse('Latitude and Longitude must be valid numbers', 400));
    }

    // 4. Create GeoJSON location object
    req.body.location = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };

    // 5. Add createdBy and cleanup
    req.body.createdBy = user._id;

    // Remove latitude/longitude if present (optional cleanup)
    delete req.body.latitude;
    delete req.body.longitude;

    // 6. Save to DB
    const chargingStation = await ChargingStation.create(req.body);

    // 7. Respond success
    res.status(201).json({
      success: true,
      data: chargingStation
    });

  } catch (err) {
    if (err.message === 'No token provided') {
      return next(new ErrorResponse(err.message, 401));
    }
    if (err.message === 'Access denied: Admins only can access this route') {
      return next(new ErrorResponse(err.message, 403));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new ErrorResponse('Invalid token', 401));
    }
    next(err);
  }
};

exports.updateChargingStation = async (req, res, next) => {
  try {
    // Verify admin
    await verifyAdmin(req.headers.authorization);

    // Handle location data
    if (req.body.latitude && req.body.longitude) {
      req.body.location = {
        type: 'Point',
        coordinates: [req.body.longitude, req.body.latitude]
      };
    }
    
    const chargingStation = await ChargingStation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!chargingStation) {
      return next(new ErrorResponse(`Charging station not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: chargingStation
    });
  } catch (err) {
    if (err.message === 'No token provided') {
      return next(new ErrorResponse(err.message, 401));
    }
    if (err.message === 'Access denied: Admins only can access this route') {
      return next(new ErrorResponse(err.message, 403));
    }
    next(err);
  }
};

exports.deleteChargingStation = async (req, res, next) => {
  try {
    // Verify admin
    await verifyAdmin(req.headers.authorization);

    const chargingStation = await ChargingStation.findByIdAndDelete(req.params.id);
    
    if (!chargingStation) {
      return next(new ErrorResponse(`Charging station not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    if (err.message === 'No token provided') {
      return next(new ErrorResponse(err.message, 401));
    }
    if (err.message === 'Access denied: Admins only can access this route') {
      return next(new ErrorResponse(err.message, 403));
    }
    next(err);
  }
};

exports.getChargingStationsInRadius = async (req, res, next) => {
  try {
    const { zipcode, distance } = req.params;
    
    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    
    if (!loc || loc.length === 0) {
      return next(new ErrorResponse(`No locations found for ${zipcode}`, 404));
    }
    
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;
    
    // Calc radius in radians
    const radius = distance / 3963;
    
    const chargingStations = await ChargingStation.find({
      location: { 
        $geoWithin: { 
          $centerSphere: [[lng, lat], radius] 
        } 
      }
    });
    
    res.status(200).json({
      success: true,
      count: chargingStations.length,
      data: chargingStations
    });
  } catch (err) {
    if (err.message.includes('Nominatim')) {
      return next(new ErrorResponse('Geocoding service unavailable', 503));
    }
    next(err);
  }
};
