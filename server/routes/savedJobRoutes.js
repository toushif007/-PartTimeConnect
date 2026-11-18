const express = require('express');
const router = express.Router();
const { getSavedJobs, saveJob, unsaveJob } = require('../controllers/savedJobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('student'));

router.get('/', getSavedJobs);
router.post('/:jobId', saveJob);
router.delete('/:jobId', unsaveJob);

module.exports = router;
