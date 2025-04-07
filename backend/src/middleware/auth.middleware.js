const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');
const AppError = require('../utils/appError');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No authentication token provided', 401));
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    
    // Check if user exists
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return next(new AppError('User not found', 401));
    }
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    
    next(error);
  }
};

module.exports = authMiddleware;
