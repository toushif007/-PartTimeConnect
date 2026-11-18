const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'parttimeconnect_jwt_secret_dev_key',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

module.exports = {
  generateToken,
};
