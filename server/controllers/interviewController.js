const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Schedule an interview for an applicant
// @route   POST /api/interviews
// @access  Private (Employer)
const scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, scheduledAt, mode, meetingLinkOrLocation, instructions } = req.body;

    if (!applicationId || !scheduledAt) {
      return sendError(res, 400, 'Application ID and scheduled date/time are required.');
    }

    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    // Must be employer for this job
    if (
      application.employer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return sendError(res, 403, 'Unauthorized to schedule interviews for this application.');
    }

    const interview = await Interview.create({
      application: application._id,
      job: application.job._id,
      student: application.student,
      employer: req.user._id,
      scheduledAt: new Date(scheduledAt),
      mode: mode || 'online',
      meetingLinkOrLocation: meetingLinkOrLocation || '',
      instructions: instructions || '',
      status: 'scheduled',
    });

    // Update application status to 'interview_scheduled'
    application.status = 'interview_scheduled';
    application.timeline.push({
      status: 'interview_scheduled',
      note: `Interview scheduled on ${new Date(scheduledAt).toLocaleString()} (${mode || 'online'}).`,
      updatedAt: new Date(),
      updatedBy: req.user._id,
    });
    await application.save();

    // Send notification to the student
    await Notification.create({
      recipient: application.student,
      sender: req.user._id,
      title: 'Interview Scheduled!',
      message: `You have an interview scheduled for "${application.job.title}" on ${new Date(
        scheduledAt
      ).toLocaleDateString()} at ${new Date(scheduledAt).toLocaleTimeString()}.`,
      type: 'interview_scheduled',
      relatedId: interview._id,
    });

    const populatedInterview = await Interview.findById(interview._id)
      .populate('job', 'title location workMode')
      .populate('student', 'name email')
      .populate('employer', 'name email');

    return sendSuccess(res, 201, 'Interview scheduled successfully.', populatedInterview);
  } catch (error) {
    next(error);
  }
};

// @desc    Get interviews for current user (student sees their interviews, employer sees theirs)
// @route   GET /api/interviews/my
// @access  Private (Student, Employer, Admin)
const getMyInterviews = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (req.user.role === 'employer') {
      filter.employer = req.user._id;
    }

    const interviews = await Interview.find(filter)
      .populate('job', 'title location workMode stipend')
      .populate('student', 'name email avatar')
      .populate('employer', 'name email avatar')
      .sort({ scheduledAt: 1 });

    return sendSuccess(res, 200, 'Interviews retrieved.', interviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Update interview details or status
// @route   PATCH /api/interviews/:id
// @access  Private (Employer or Admin)
const updateInterview = async (req, res, next) => {
  try {
    const { scheduledAt, mode, meetingLinkOrLocation, instructions, status } = req.body;

    const interview = await Interview.findById(req.params.id).populate('job', 'title');
    if (!interview) {
      return sendError(res, 404, 'Interview not found.');
    }

    if (
      interview.employer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return sendError(res, 403, 'Unauthorized to modify this interview.');
    }

    if (scheduledAt) interview.scheduledAt = new Date(scheduledAt);
    if (mode) interview.mode = mode;
    if (meetingLinkOrLocation !== undefined) interview.meetingLinkOrLocation = meetingLinkOrLocation;
    if (instructions !== undefined) interview.instructions = instructions;
    if (status) interview.status = status;

    await interview.save();

    // Notify student about update
    await Notification.create({
      recipient: interview.student,
      sender: req.user._id,
      title: 'Interview Details Updated',
      message: `The interview details for "${interview.job?.title || 'Job'}" have been updated. Status: ${interview.status}.`,
      type: 'interview_scheduled',
      relatedId: interview._id,
    });

    return sendSuccess(res, 200, 'Interview updated successfully.', interview);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scheduleInterview,
  getMyInterviews,
  updateInterview,
};
