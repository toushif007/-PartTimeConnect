const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'parttimeconnect_jwt_secret_dev_key'
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 401, 'Invalid session. User no longer exists.');
    }

    if (user.isBlocked) {
      return sendError(
        res,
        403,
        'Your account has been blocked by an administrator. Please contact support.'
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, 'Not authorized. Invalid or expired token.');
  }
};

module.exports = {
  protect,
};
