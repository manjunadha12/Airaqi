const { verifyAccessToken } = require('../config/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'dummy-token' || token === 'null' || token === 'undefined') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Authentication session expired or invalid. Please sign in again.',
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated. Please contact support.',
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed',
    });
  }
};

const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    if (!token || token === 'dummy-token' || token === 'null' || token === 'undefined') {
      return next();
    }
    try {
      const decoded = verifyAccessToken(token);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
          req.userId = user._id;
        }
      }
    } catch (e) {
      // Continue without user if token expired
    }
    next();
  } catch (err) {
    next();
  }
};

authenticate.optionalAuthenticate = optionalAuthenticate;
module.exports = authenticate;
