const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  toggleUserBlock,
  getAllJobsAdmin,
  deleteJobAdmin,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/block', toggleUserBlock);
router.get('/jobs', getAllJobsAdmin);
router.delete('/jobs/:id', deleteJobAdmin);

module.exports = router;
