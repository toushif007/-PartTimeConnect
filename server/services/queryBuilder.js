/**
 * Query Builder Service for Job Search, Filtering, Sorting & Pagination
 */
const buildJobFilter = (queryParams) => {
  const filter = {};

  // Status filter (default to 'active' unless specified)
  if (queryParams.status) {
    filter.status = queryParams.status;
  } else {
    filter.status = 'active';
  }

  // Keyword / Text search (title, description, required skills)
  if (queryParams.keyword && queryParams.keyword.trim() !== '') {
    const term = queryParams.keyword.trim();
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { location: { $regex: term, $options: 'i' } },
      { requiredSkills: { $in: [new RegExp(term, 'i')] } },
    ];
  }

  // Category filter
  if (queryParams.category && queryParams.category !== 'all') {
    filter.category = queryParams.category;
  }

  // Work Mode filter (remote, on-site, hybrid)
  if (queryParams.workMode && queryParams.workMode !== 'all') {
    filter.workMode = queryParams.workMode;
  }

  // Job Type filter (part-time, internship, freelance)
  if (queryParams.jobType && queryParams.jobType !== 'all') {
    filter.jobType = queryParams.jobType;
  }

  // Location filter
  if (queryParams.location && queryParams.location.trim() !== '') {
    filter.location = { $regex: queryParams.location.trim(), $options: 'i' };
  }

  // Stipend range filter
  if (queryParams.minStipend || queryParams.maxStipend) {
    filter['stipend.amount'] = {};
    if (queryParams.minStipend) {
      filter['stipend.amount'].$gte = Number(queryParams.minStipend);
    }
    if (queryParams.maxStipend) {
      filter['stipend.amount'].$lte = Number(queryParams.maxStipend);
    }
  }

  // Skills filter
  if (queryParams.skills) {
    const skillList = Array.isArray(queryParams.skills)
      ? queryParams.skills
      : queryParams.skills.split(',').map((s) => s.trim());
    if (skillList.length > 0) {
      filter.requiredSkills = {
        $in: skillList.map((s) => new RegExp(`^${s}$`, 'i')),
      };
    }
  }

  return filter;
};

const buildJobSort = (sortBy) => {
  switch (sortBy) {
    case 'stipend_high':
    case 'stipend-desc':
      return { 'stipend.amount': -1 };
    case 'stipend_low':
    case 'stipend-asc':
      return { 'stipend.amount': 1 };
    case 'views':
    case 'popular':
      return { viewsCount: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

const getPagination = (queryPage, queryLimit, defaultLimit = 10) => {
  const page = Math.max(1, parseInt(queryPage, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(queryLimit, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

module.exports = {
  buildJobFilter,
  buildJobSort,
  getPagination,
};
