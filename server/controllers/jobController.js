const Job = require('../models/Job');
const EmployerProfile = require('../models/EmployerProfile');
const { buildJobFilter, buildJobSort, getPagination } = require('../services/queryBuilder');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all jobs (Search, Filter, Sort, Paginate)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const filter = buildJobFilter(req.query);
    const sort = buildJobSort(req.query.sortBy);
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

    const totalJobs = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .populate('category', 'name slug icon')
      .populate('employer', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Attach company profile info
    const employerIds = [...new Set(jobs.map((j) => j.employer?._id).filter(Boolean))];
    const employerProfiles = await EmployerProfile.find({ user: { $in: employerIds } });
    const profileMap = {};
    employerProfiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const enrichedJobs = jobs.map((job) => {
      const jobObj = job.toObject();
      if (jobObj.employer && profileMap[jobObj.employer._id.toString()]) {
        jobObj.company = profileMap[jobObj.employer._id.toString()];
      }
      return jobObj;
    });

    const totalPages = Math.ceil(totalJobs / limit);

    return sendSuccess(
      res,
      200,
      'Jobs retrieved successfully.',
      enrichedJobs,
      {
        total: totalJobs,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured jobs for homepage
// @route   GET /api/jobs/featured
// @access  Public
const getFeaturedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'active' })
      .populate('category', 'name slug icon')
      .populate('employer', 'name email avatar')
      .sort({ viewsCount: -1, createdAt: -1 })
      .limit(6);

    const employerIds = [...new Set(jobs.map((j) => j.employer?._id).filter(Boolean))];
    const profiles = await EmployerProfile.find({ user: { $in: employerIds } });
    const map = {};
    profiles.forEach((p) => {
      map[p.user.toString()] = p;
    });

    const enriched = jobs.map((job) => {
      const j = job.toObject();
      if (j.employer && map[j.employer._id.toString()]) {
        j.company = map[j.employer._id.toString()];
      }
      return j;
    });

    return sendSuccess(res, 200, 'Featured jobs retrieved.', enriched);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID & increment view count
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    )
      .populate('category', 'name slug icon description')
      .populate('employer', 'name email avatar');

    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    const jobObj = job.toObject();
    if (jobObj.employer) {
      const company = await EmployerProfile.findOne({ user: jobObj.employer._id });
      jobObj.company = company || null;
    }

    return sendSuccess(res, 200, 'Job details retrieved.', jobObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job listing
// @route   POST /api/jobs
// @access  Private (Employer)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      jobType,
      workMode,
      location,
      requiredSkills,
      stipend,
      vacancies,
      deadline,
    } = req.body;

    if (!title || !description || !category || !stipend || stipend.amount === undefined) {
      return sendError(res, 400, 'Please provide all required job fields: title, description, category, and stipend amount.');
    }

    // Process skills array
    let skillsArray = [];
    if (Array.isArray(requiredSkills)) {
      skillsArray = requiredSkills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof requiredSkills === 'string') {
      skillsArray = requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const job = await Job.create({
      employer: req.user._id,
      title: title.trim(),
      description,
      category,
      jobType: jobType || 'part-time',
      workMode: workMode || 'remote',
      location: location || 'Remote',
      requiredSkills: skillsArray,
      stipend: {
        amount: Number(stipend.amount),
        frequency: stipend.frequency || 'monthly',
        isNegotiable: Boolean(stipend.isNegotiable),
      },
      vacancies: Number(vacancies) || 1,
      deadline: deadline || null,
      status: 'active',
    });

    const populatedJob = await Job.findById(job._id)
      .populate('category', 'name slug icon')
      .populate('employer', 'name email');

    return sendSuccess(res, 201, 'Job created successfully.', populatedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing job listing
// @route   PUT /api/jobs/:id
// @access  Private (Employer owner or Admin)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    // Check authorization: must be job owner or admin
    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Unauthorized. You can only edit jobs you posted.');
    }

    const {
      title,
      description,
      category,
      jobType,
      workMode,
      location,
      requiredSkills,
      stipend,
      vacancies,
      deadline,
      status,
    } = req.body;

    if (title) job.title = title.trim();
    if (description) job.description = description;
    if (category) job.category = category;
    if (jobType) job.jobType = jobType;
    if (workMode) job.workMode = workMode;
    if (location !== undefined) job.location = location;
    if (vacancies) job.vacancies = Number(vacancies);
    if (deadline !== undefined) job.deadline = deadline;
    if (status) job.status = status;

    if (requiredSkills) {
      job.requiredSkills = Array.isArray(requiredSkills)
        ? requiredSkills.map((s) => s.trim()).filter(Boolean)
        : requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    if (stipend) {
      if (stipend.amount !== undefined) job.stipend.amount = Number(stipend.amount);
      if (stipend.frequency) job.stipend.frequency = stipend.frequency;
      if (stipend.isNegotiable !== undefined) job.stipend.isNegotiable = Boolean(stipend.isNegotiable);
    }

    await job.save();

    const updatedJob = await Job.findById(job._id)
      .populate('category', 'name slug icon')
      .populate('employer', 'name email');

    return sendSuccess(res, 200, 'Job updated successfully.', updatedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job listing
// @route   DELETE /api/jobs/:id
// @access  Private (Employer owner or Admin)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    // Must be job owner or admin
    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Unauthorized. You can only delete jobs you posted.');
    }

    await Job.findByIdAndDelete(req.params.id);

    return sendSuccess(res, 200, 'Job deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle job status (active <-> paused)
// @route   PATCH /api/jobs/:id/status
// @access  Private (Employer owner)
const toggleJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Unauthorized.');
    }

    const { status } = req.body;
    if (status && ['active', 'paused', 'closed'].includes(status)) {
      job.status = status;
    } else {
      job.status = job.status === 'active' ? 'paused' : 'active';
    }

    await job.save();
    return sendSuccess(res, 200, `Job status updated to ${job.status}.`, job);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getFeaturedJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
};
