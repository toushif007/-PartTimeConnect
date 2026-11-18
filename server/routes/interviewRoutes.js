const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getMyInterviews,
  updateInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('employer'), scheduleInterview);
router.get('/my', getMyInterviews);
router.patch('/:id', authorize('employer', 'admin'), updateInterview);

module.exports = router;
