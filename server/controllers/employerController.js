const fs = require('fs');
const path = require('path');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const Interview = require('../models/Interview');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get employer profile
// @route   GET /api/employers/profile
// @access  Private (Employer)
const getProfile = async (req, res, next) => {
  try {
    let profile = await EmployerProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email avatar isBlocked createdAt'
    );

    if (!profile) {
      profile = await EmployerProfile.create({
        user: req.user._id,
        companyName: `${req.user.name}'s Company`,
      });
      profile = await EmployerProfile.findById(profile._id).populate('user', 'name email avatar isBlocked createdAt');
    }

    return sendSuccess(res, 200, 'Employer profile retrieved.', profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Update employer profile
// @route   PUT /api/employers/profile
// @access  Private (Employer)
const updateProfile = async (req, res, next) => {
  try {
    const {
      companyName,
      companyWebsite,
      industry,
      companySize,
      location,
      companyDescription,
      contactPhone,
      logo,
    } = req.body;

    let profile = await EmployerProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new EmployerProfile({ user: req.user._id, companyName: companyName || req.user.name });
    }

    if (companyName) profile.companyName = companyName.trim();
    if (companyWebsite !== undefined) profile.companyWebsite = companyWebsite.trim();
    if (industry !== undefined) profile.industry = industry.trim();
    if (companySize !== undefined) profile.companySize = companySize;
    if (location !== undefined) profile.location = location.trim();
    if (companyDescription !== undefined) profile.companyDescription = companyDescription.trim();
    if (contactPhone !== undefined) profile.contactPhone = contactPhone.trim();
    if (logo !== undefined) profile.logo = logo.trim();

    await profile.save();
    const updated = await EmployerProfile.findById(profile._id).populate('user', 'name email avatar');

    return sendSuccess(res, 200, 'Company profile updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs posted by authenticated employer
// @route   GET /api/employers/jobs
// @access  Private (Employer)
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user._id })
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Employer jobs retrieved.', jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a specific job
// @route   GET /api/employers/jobs/:jobId/applicants
// @access  Private (Employer)
const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Verify employer owns the job
    const job = await Job.findById(jobId);
    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }
    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Unauthorized. You can only view applicants for your own jobs.');
    }

    const applications = await Application.find({ job: jobId })
      .populate('student', 'name email avatar')
      .sort({ createdAt: -1 });

    // Enforce profile details attachment
    const studentUserIds = applications.map((app) => app.student?._id).filter(Boolean);
    const studentProfiles = await StudentProfile.find({ user: { $in: studentUserIds } });
    const profileMap = {};
    studentProfiles.forEach((sp) => {
      profileMap[sp.user.toString()] = sp;
    });

    const enriched = applications.map((app) => {
      const a = app.toObject();
      if (a.student && profileMap[a.student._id.toString()]) {
        a.studentProfile = profileMap[a.student._id.toString()];
      }
      return a;
    });

    return sendSuccess(res, 200, 'Applicants retrieved.', enriched);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applicants across all jobs posted by this employer
// @route   GET /api/employers/applicants
// @access  Private (Employer)
const getAllApplicants = async (req, res, next) => {
  try {
    const applications = await Application.find({ employer: req.user._id })
      .populate('job', 'title category workMode location stipend status')
      .populate('student', 'name email avatar')
      .sort({ createdAt: -1 });

    const studentUserIds = applications.map((app) => app.student?._id).filter(Boolean);
    const studentProfiles = await StudentProfile.find({ user: { $in: studentUserIds } });
    const profileMap = {};
    studentProfiles.forEach((sp) => {
      profileMap[sp.user.toString()] = sp;
    });

    const enriched = applications.map((app) => {
      const a = app.toObject();
      if (a.student && profileMap[a.student._id.toString()]) {
        a.studentProfile = profileMap[a.student._id.toString()];
      }
      return a;
    });

    return sendSuccess(res, 200, 'All applicants retrieved.', enriched);
  } catch (error) {
    next(error);
  }
};

// @desc    Securely download applicant resume
// @route   GET /api/employers/applicants/:applicationId/resume
// @access  Private (Employer)
const downloadApplicantResume = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    // Strict Security Check: Employer must own the job of this application (or be admin)
    if (
      application.employer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return sendError(
        res,
        403,
        'Forbidden. You do not have permission to access resumes for this applicant.'
      );
    }

    // Check if snapshot path or current profile resume exists
    let filePath = application.resumeSnapshot?.path;
    let fileName = application.resumeSnapshot?.originalName || 'Applicant_Resume.pdf';

    if (!filePath || !fs.existsSync(filePath)) {
      // Fallback to student's current profile resume if path exists
      const studentProfile = await StudentProfile.findOne({ user: application.student });
      if (studentProfile?.resume?.path && fs.existsSync(studentProfile.resume.path)) {
        filePath = studentProfile.resume.path;
        fileName = studentProfile.resume.originalName;
      }
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return sendError(res, 404, 'Applicant resume file is not available on the server.');
    }

    return res.download(filePath, fileName);
  } catch (error) {
    next(error);
  }
};

// @desc    Get employer dashboard stats
// @route   GET /api/employers/dashboard-stats
// @access  Private (Employer)
const getDashboardStats = async (req, res, next) => {
  try {
    const employerId = req.user._id;

    const [totalJobs, activeJobs, totalApplicants, pendingReviews, scheduledInterviews] =
      await Promise.all([
        Job.countDocuments({ employer: employerId }),
        Job.countDocuments({ employer: employerId, status: 'active' }),
        Application.countDocuments({ employer: employerId }),
        Application.countDocuments({ employer: employerId, status: 'applied' }),
        Interview.countDocuments({ employer: employerId, status: 'scheduled' }),
      ]);

    const recentApplications = await Application.find({ employer: employerId })
      .populate('job', 'title')
      .populate('student', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    return sendSuccess(res, 200, 'Employer dashboard stats retrieved.', {
      totalJobs,
      activeJobs,
      totalApplicants,
      pendingReviews,
      scheduledInterviews,
      recentApplications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMyJobs,
  getJobApplicants,
  getAllApplicants,
  downloadApplicantResume,
  getDashboardStats,
};
