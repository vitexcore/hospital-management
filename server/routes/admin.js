const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, updateUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

module.exports = router;
