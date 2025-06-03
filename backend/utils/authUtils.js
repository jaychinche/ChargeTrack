const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyToken = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};

exports.verifyAdmin = async (authHeader) => {
  const decoded = await exports.verifyToken(authHeader);
  const user = await User.findById(decoded.id);
  
  if (!user || user.role !== 'admin') {
    throw new Error('Access denied: Admins only can access this route');
  }
  
  return user;
};
