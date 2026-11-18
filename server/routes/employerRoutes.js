const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getMyJobs,
  getJobApplicants,
  getAllApplicants,
  downloadApplicantResume,
  getDashboardStats,
} = require('../controllers/employerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('employer'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/jobs', getMyJobs);
router.get('/jobs/:jobId/applicants', getJobApplicants);
router.get('/applicants', getAllApplicants);
router.get('/applicants/:applicationId/resume', downloadApplicantResume);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
