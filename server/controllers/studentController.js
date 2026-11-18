const fs = require('fs');
const path = require('path');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Interview = require('../models/Interview');
const { getRecommendedJobs } = require('../services/recommendationService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private (Student)
const getProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email avatar isBlocked createdAt'
    );

    if (!profile) {
      profile = await StudentProfile.create({ user: req.user._id });
      profile = await StudentProfile.findById(profile._id).populate('user', 'name email avatar isBlocked createdAt');
    }

    return sendSuccess(res, 200, 'Student profile retrieved.', profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (Student)
const updateProfile = async (req, res, next) => {
  try {
    const { college, course, graduationYear, phone, bio, skills, location } = req.body;

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user._id });
    }

    if (college !== undefined) profile.college = college.trim();
    if (course !== undefined) profile.course = course.trim();
    if (graduationYear !== undefined) profile.graduationYear = graduationYear ? Number(graduationYear) : null;
    if (phone !== undefined) profile.phone = phone.trim();
    if (bio !== undefined) profile.bio = bio.trim();
    if (location !== undefined) profile.location = location.trim();

    if (skills !== undefined) {
      profile.skills = Array.isArray(skills)
        ? skills.map((s) => s.trim().toLowerCase()).filter(Boolean)
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
        : profile.skills;
    }

    await profile.save();
    const updated = await StudentProfile.findById(profile._id).populate('user', 'name email avatar');

    return sendSuccess(res, 200, 'Student profile updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload or replace resume
// @route   POST /api/students/resume
// @access  Private (Student)
const uploadResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded. Please select a valid PDF, DOC, or DOCX document.');
    }

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user._id });
    }

    // If an old resume existed, safely delete it from disk
    if (profile.resume && profile.resume.path && fs.existsSync(profile.resume.path)) {
      try {
        fs.unlinkSync(profile.resume.path);
      } catch (err) {
        console.warn('Could not remove previous resume file:', err.message);
      }
    }

    profile.resume = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date(),
      path: req.file.path,
    };

    await profile.save();

    return sendSuccess(res, 200, 'Resume uploaded successfully.', {
      resume: {
        filename: profile.resume.filename,
        originalName: profile.resume.originalName,
        size: profile.resume.size,
        uploadDate: profile.resume.uploadDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download student's own resume
// @route   GET /api/students/resume
// @access  Private (Student)
const downloadOwnResume = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile || !profile.resume || !profile.resume.path) {
      return sendError(res, 404, 'No resume found on your profile.');
    }

    if (!fs.existsSync(profile.resume.path)) {
      return sendError(res, 404, 'Resume file not found on server.');
    }

    return res.download(profile.resume.path, profile.resume.originalName);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student's resume
// @route   DELETE /api/students/resume
// @access  Private (Student)
const deleteResumeFile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile || !profile.resume || !profile.resume.path) {
      return sendError(res, 404, 'No resume found to delete.');
    }

    if (fs.existsSync(profile.resume.path)) {
      try {
        fs.unlinkSync(profile.resume.path);
      } catch (err) {
        console.warn('Could not delete resume file from disk:', err.message);
      }
    }

    profile.resume = {
      filename: '',
      originalName: '',
      mimeType: '',
      size: 0,
      uploadDate: null,
      path: '',
    };

    await profile.save();

    return sendSuccess(res, 200, 'Resume removed successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get rule-based job recommendations
// @route   GET /api/students/recommendations
// @access  Private (Student)
const getRecommendations = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return sendError(res, 404, 'Student profile not found. Please complete profile first.');
    }

    const activeJobs = await Job.find({ status: 'active' })
      .populate('category', 'name slug icon')
      .populate('employer', 'name email');

    const recommended = await getRecommendedJobs(profile, activeJobs);

    return sendSuccess(res, 200, 'Recommendations calculated.', recommended);
  } catch (error) {
    next(error);
  }
};

// @desc    Get student dashboard statistics
// @route   GET /api/students/dashboard-stats
// @access  Private (Student)
const getDashboardStats = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const [totalApplications, shortlisted, interviews, savedCount, recentApplications] =
      await Promise.all([
        Application.countDocuments({ student: studentId }),
        Application.countDocuments({ student: studentId, status: 'shortlisted' }),
        Interview.countDocuments({ student: studentId }),
        SavedJob.countDocuments({ student: studentId }),
        Application.find({ student: studentId })
          .populate({
            path: 'job',
            populate: { path: 'category', select: 'name icon' },
          })
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    return sendSuccess(res, 200, 'Student dashboard stats retrieved.', {
      totalApplications,
      shortlisted,
      interviews,
      savedCount,
      recentApplications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResumeFile,
  downloadOwnResume,
  deleteResumeFile,
  getRecommendations,
  getDashboardStats,
};
