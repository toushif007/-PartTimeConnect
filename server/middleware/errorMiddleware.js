const { sendError } = require('../utils/apiResponse');

const notFoundHandler = (req, res, next) => {
  return sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with invalid ID: ${err.value}`;
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const fields = Object.keys(err.keyValue || {});
    message = `Duplicate value entered for field: ${fields.join(', ')}. Must be unique.`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((val) => val.message);
  }

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size limit exceeded. Maximum allowed size is 5 MB.';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  // Development logging
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${statusCode} - ${message}:`, err.stack || err);
  }

  return sendError(res, statusCode, message, errors);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
