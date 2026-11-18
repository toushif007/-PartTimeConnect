const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all saved jobs for current student
// @route   GET /api/saved-jobs
// @access  Private (Student)
const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ student: req.user._id })
      .populate({
        path: 'job',
        populate: [
          { path: 'category', select: 'name icon slug' },
          { path: 'employer', select: 'name email' },
        ],
      })
      .sort({ createdAt: -1 });

    // Filter out jobs that might have been deleted
    const validSavedJobs = savedJobs.filter((item) => item.job !== null);

    return sendSuccess(res, 200, 'Saved jobs retrieved.', validSavedJobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Save/bookmark a job
// @route   POST /api/saved-jobs/:jobId
// @access  Private (Student)
const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    const existing = await SavedJob.findOne({ student: req.user._id, job: jobId });
    if (existing) {
      return sendError(res, 400, 'Job is already in your saved list.');
    }

    const saved = await SavedJob.create({
      student: req.user._id,
      job: jobId,
    });

    return sendSuccess(res, 201, 'Job saved successfully.', saved);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove job from saved list
// @route   DELETE /api/saved-jobs/:jobId
// @access  Private (Student)
const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const removed = await SavedJob.findOneAndDelete({
      student: req.user._id,
      job: jobId,
    });

    if (!removed) {
      return sendError(res, 404, 'Job was not found in your saved list.');
    }

    return sendSuccess(res, 200, 'Job removed from saved list.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSavedJobs,
  saveJob,
  unsaveJob,
};
