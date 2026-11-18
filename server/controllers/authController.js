const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const EmployerProfile = require('../models/EmployerProfile');
const { generateToken } = require('../utils/tokenUtils');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Register a new user (Student or Employer only)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Please provide name, email, and password.');
    }

    // Security rule: Admin accounts cannot be created via public registration
    if (role === 'admin') {
      return sendError(res, 403, 'Admin registration is not permitted through public signup.');
    }

    const assignedRole = role === 'employer' ? 'employer' : 'student';

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return sendError(res, 400, 'An account with this email address already exists.');
    }

    // Create base user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
    });

    // Automatically create corresponding profile
    if (assignedRole === 'student') {
      await StudentProfile.create({
        user: user._id,
        college: req.body.college || '',
        course: req.body.course || '',
        location: req.body.location || '',
      });
    } else if (assignedRole === 'employer') {
      await EmployerProfile.create({
        user: user._id,
        companyName: companyName ? companyName.trim() : `${name.trim()}'s Company`,
        location: req.body.location || '',
      });
    }

    const token = generateToken(user._id, user.role);

    return sendSuccess(
      res,
      201,
      'User registered successfully.',
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide an email and password.');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    // Check if user is blocked by admin
    if (user.isBlocked) {
      return sendError(
        res,
        403,
        'Your account has been suspended by an administrator. Please contact support.'
      );
    }

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 200, 'Login successful.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user & profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'employer') {
      profile = await EmployerProfile.findOne({ user: user._id });
    }

    return sendSuccess(res, 200, 'Current user retrieved.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (stateless)
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  return sendSuccess(res, 200, 'Logged out successfully.');
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
