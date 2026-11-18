const express = require('express');
const router = express.Router();
const {
  getJobs,
  getFeaturedJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/:id', getJobById);

// Protected routes
router.post('/', protect, authorize('employer'), createJob);
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);
router.patch('/:id/status', protect, authorize('employer', 'admin'), toggleJobStatus);

module.exports = router;
