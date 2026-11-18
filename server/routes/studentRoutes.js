const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadResumeFile,
  downloadOwnResume,
  deleteResumeFile,
  getRecommendations,
  getDashboardStats,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(authorize('student'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/resume', uploadResume.single('resume'), uploadResumeFile);
router.get('/resume', downloadOwnResume);
router.delete('/resume', deleteResumeFile);
router.get('/recommendations', getRecommendations);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
