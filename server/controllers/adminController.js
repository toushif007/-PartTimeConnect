const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const JobReport = require('../models/JobReport');
const Category = require('../models/Category');
const StudentProfile = require('../models/StudentProfile');
const EmployerProfile = require('../models/EmployerProfile');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get complete platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalEmployers,
      totalJobs,
      activeJobs,
      pausedJobs,
      totalApplications,
      pendingReports,
      totalCategories,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ status: 'paused' }),
      Application.countDocuments(),
      JobReport.countDocuments({ status: 'pending' }),
      Category.countDocuments(),
    ]);

    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentJobs = await Job.find()
      .populate('employer', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return sendSuccess(res, 200, 'Platform analytics retrieved.', {
      counts: {
        totalStudents,
        totalEmployers,
        totalJobs,
        activeJobs,
        pausedJobs,
        totalApplications,
        pendingReports,
        totalCategories,
      },
      recentUsers,
      recentJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search, role filter, pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, isBlocked, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (role && ['student', 'employer', 'admin'].includes(role)) {
      filter.role = role;
    }

    if (isBlocked !== undefined && isBlocked !== '') {
      filter.isBlocked = isBlocked === 'true';
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Attach student or employer details if available
    const userIds = users.map((u) => u._id);
    const [studentProfiles, employerProfiles] = await Promise.all([
      StudentProfile.find({ user: { $in: userIds } }),
      EmployerProfile.find({ user: { $in: userIds } }),
    ]);

    const sMap = {};
    studentProfiles.forEach((p) => (sMap[p.user.toString()] = p));
    const eMap = {};
    employerProfiles.forEach((p) => (eMap[p.user.toString()] = p));

    const enrichedUsers = users.map((u) => {
      const obj = u.toObject();
      if (u.role === 'student') obj.profile = sMap[u._id.toString()] || null;
      if (u.role === 'employer') obj.profile = eMap[u._id.toString()] || null;
      return obj;
    });

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(res, 200, 'Users retrieved.', enrichedUsers, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block or unblock a user
// @route   PATCH /api/admin/users/:id/block
// @access  Private (Admin)
const toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    if (user.role === 'admin') {
      return sendError(res, 400, 'Cannot block an administrator account.');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    const action = user.isBlocked ? 'blocked' : 'unblocked';
    return sendSuccess(res, 200, `User account has been ${action}.`, {
      userId: user._id,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for moderation (with status filters & search)
// @route   GET /api/admin/jobs
// @access  Private (Admin)
const getAllJobsAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('employer', 'name email')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 200, 'Jobs retrieved for moderation.', jobs, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job permanently by admin
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin)
const deleteJobAdmin = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    // Clean up related applications and saved records
    await Application.deleteMany({ job: req.params.id });
    await JobReport.deleteMany({ job: req.params.id });

    return sendSuccess(res, 200, 'Job and related records removed by admin.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAllUsers,
  toggleUserBlock,
  getAllJobsAdmin,
  deleteJobAdmin,
};
