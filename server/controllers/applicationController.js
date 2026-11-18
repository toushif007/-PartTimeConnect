const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Student)
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverNote } = req.body;

    if (!jobId) {
      return sendError(res, 400, 'Please provide a valid job ID.');
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    if (job.status !== 'active') {
      return sendError(res, 400, 'This job listing is currently not accepting applications.');
    }

    // Check student profile and resume
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile || !studentProfile.resume || !studentProfile.resume.path) {
      return sendError(
        res,
        400,
        'Please upload your resume to your profile before applying for jobs.'
      );
    }

    // Check duplicate application
    const alreadyApplied = await Application.findOne({
      job: jobId,
      student: req.user._id,
    });
    if (alreadyApplied) {
      return sendError(res, 400, 'You have already applied for this job.');
    }

    // Create application with resume snapshot
    const application = await Application.create({
      job: jobId,
      student: req.user._id,
      employer: job.employer,
      coverNote: coverNote ? coverNote.trim() : '',
      resumeSnapshot: {
        filename: studentProfile.resume.filename,
        originalName: studentProfile.resume.originalName,
        path: studentProfile.resume.path,
        mimeType: studentProfile.resume.mimeType,
      },
      timeline: [
        {
          status: 'applied',
          note: 'Application submitted successfully by student.',
          updatedAt: new Date(),
          updatedBy: req.user._id,
        },
      ],
    });

    // Increment application count on the job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    // Notify the employer
    await Notification.create({
      recipient: job.employer,
      sender: req.user._id,
      title: 'New Job Application',
      message: `${req.user.name} applied for "${job.title}".`,
      type: 'application_submitted',
      relatedId: application._id,
    });

    return sendSuccess(res, 201, 'Application submitted successfully!', application);
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's submitted applications
// @route   GET /api/applications/my
// @access  Private (Student)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: 'job',
        populate: [
          { path: 'category', select: 'name icon slug' },
          { path: 'employer', select: 'name email' },
        ],
      })
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Applications retrieved.', applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private (Student owner, Employer owner, or Admin)
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        populate: { path: 'category', select: 'name icon slug' },
      })
      .populate('student', 'name email avatar')
      .populate('employer', 'name email');

    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    // Role check: Only the applicant student, the employer, or admin can view
    const isStudentOwner = application.student._id.toString() === req.user._id.toString();
    const isEmployerOwner = application.employer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudentOwner && !isEmployerOwner && !isAdmin) {
      return sendError(res, 403, 'Unauthorized to view this application.');
    }

    // Attach student profile if employer or admin
    let studentProfile = null;
    if (isEmployerOwner || isAdmin) {
      studentProfile = await StudentProfile.findOne({ user: application.student._id });
    }

    return sendSuccess(res, 200, 'Application details retrieved.', {
      application,
      studentProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id/withdraw
// @access  Private (Student)
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    if (application.student.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You can only withdraw your own applications.');
    }

    if (['hired', 'withdrawn', 'rejected'].includes(application.status)) {
      return sendError(
        res,
        400,
        `Cannot withdraw an application that is already marked as ${application.status}.`
      );
    }

    application.status = 'withdrawn';
    application.timeline.push({
      status: 'withdrawn',
      note: 'Application withdrawn by student.',
      updatedAt: new Date(),
      updatedBy: req.user._id,
    });
    await application.save();

    // Decrement application count on job
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

    return sendSuccess(res, 200, 'Application withdrawn successfully.', application);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (shortlist, reject, hire, etc.)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer or Admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['applied', 'shortlisted', 'interview_scheduled', 'rejected', 'hired'];

    if (!status || !validStatuses.includes(status)) {
      return sendError(
        res,
        400,
        `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      );
    }

    const application = await Application.findById(req.params.id).populate('job', 'title');
    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    // Employer ownership or admin check
    if (
      application.employer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return sendError(res, 403, 'Unauthorized to update this application.');
    }

    application.status = status;
    application.timeline.push({
      status,
      note: note ? note.trim() : `Status updated to ${status}.`,
      updatedAt: new Date(),
      updatedBy: req.user._id,
    });

    await application.save();

    // Send in-app notification to the student
    await Notification.create({
      recipient: application.student,
      sender: req.user._id,
      title: 'Application Status Updated',
      message: `Your application for "${application.job?.title || 'Job'}" has been updated to "${status.replace('_', ' ').toUpperCase()}".`,
      type: 'status_updated',
      relatedId: application._id,
    });

    return sendSuccess(res, 200, `Application status updated to ${status}.`, application);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  updateApplicationStatus,
};
