const JobReport = require('../models/JobReport');
const Job = require('../models/Job');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Report an inappropriate/suspicious job
// @route   POST /api/reports
// @access  Private (Student)
const reportJob = async (req, res, next) => {
  try {
    const { jobId, reason, details } = req.body;

    if (!jobId || !details) {
      return sendError(res, 400, 'Please provide job ID and details explaining the report.');
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    const report = await JobReport.create({
      job: jobId,
      reportedBy: req.user._id,
      reason: reason || 'other',
      details: details.trim(),
    });

    return sendSuccess(
      res,
      201,
      'Job report submitted. Platform moderators will review this listing.',
      report
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all job reports
// @route   GET /api/reports
// @access  Private (Admin)
const getAllReports = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const reports = await JobReport.find(filter)
      .populate({
        path: 'job',
        populate: [
          { path: 'employer', select: 'name email' },
          { path: 'category', select: 'name' },
        ],
      })
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Reports retrieved.', reports);
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve a job report
// @route   PATCH /api/reports/:id/resolve
// @access  Private (Admin)
const resolveReport = async (req, res, next) => {
  try {
    const { status, resolutionNotes, deleteJob } = req.body;

    const report = await JobReport.findById(req.params.id);
    if (!report) {
      return sendError(res, 404, 'Report not found.');
    }

    report.status = status || 'reviewed';
    if (resolutionNotes) {
      report.resolutionNotes = resolutionNotes.trim();
    }
    report.resolvedBy = req.user._id;
    await report.save();

    // If admin chose to delete the fraudulent job
    if (deleteJob) {
      await Job.findByIdAndDelete(report.job);
      report.status = 'action_taken';
      await report.save();
    }

    return sendSuccess(res, 200, 'Report resolved successfully.', report);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reportJob,
  getAllReports,
  resolveReport,
};
