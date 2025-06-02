const jwt = require('jsonwebtoken');
const ChargingStation = require('../models/ChargingStation');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const User = require('../models/User');


exports.getDashboardStats = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let user = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        user = null;
      }
    }
    const [totalChargers, activeChargers, inactiveChargers, totalUsers] = await Promise.all([
      ChargingStation.countDocuments(),
      ChargingStation.countDocuments({ status: 'Active' }),
      ChargingStation.countDocuments({ status: { $in: ['Inactive', 'Maintenance'] } }),
      User.countDocuments(),
    ]);
    const userInfo = user
      ? {
        username: user.username,
        role: user.role,
        email: user.email,
      }
      : null;

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
    const { status, powerOutput, connectorType, name, sort, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (powerOutput) query.powerOutput = powerOutput;
    if (connectorType) query.connectorType = connectorType;
    if (name) query.name = { $regex: name, $options: 'i' };

    let sortOption = '-createdAt';
    if (sort) {
      sortOption = sort.startsWith('-')
        ? { [sort.substring(1)]: -1 }
        : { [sort]: 1 };
    }
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
    console.log('Incoming request body:', req.body);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    let latitude, longitude;
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
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude must be valid numbers' });
    }

    req.body.location = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };

    req.body.createdBy = userId;
    delete req.body.latitude;
    delete req.body.longitude;

    const chargingStation = await ChargingStation.create(req.body);

    res.status(201).json({
      success: true,
      data: chargingStation
    });

  } catch (err) {
    console.error('Error creating charging station:', err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
exports.updateChargingStation = async (req, res, next) => {
  try {
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
    next(err);
  }
};

exports.deleteChargingStation = async (req, res, next) => {
  try {
    const chargingStation = await ChargingStation.findByIdAndDelete(req.params.id);

    if (!chargingStation) {
      return next(new ErrorResponse(`Charging station not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
exports.getChargingStationsInRadius = async (req, res, next) => {
  try {
    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);

    if (!loc || loc.length === 0) {
      return next(new ErrorResponse(`No locations found for ${zipcode}`, 404));
    }

    const lat = loc[0].latitude;
    const lng = loc[0].longitude;
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