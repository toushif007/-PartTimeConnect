const express = require('express');
const router = express.Router();
const { reportJob, getAllReports, resolveReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('student'), reportJob);
router.get('/', authorize('admin'), getAllReports);
router.patch('/:id/resolve', authorize('admin'), resolveReport);

module.exports = router;
