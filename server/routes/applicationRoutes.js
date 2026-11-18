const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('student'), applyForJob);
router.get('/my', authorize('student'), getMyApplications);
router.delete('/:id/withdraw', authorize('student'), withdrawApplication);
router.get('/:id', getApplicationById);
router.put('/:id/status', authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;
