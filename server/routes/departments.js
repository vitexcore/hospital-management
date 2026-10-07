const express = require('express');
const router = express.Router();
const { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getDepartments);
router.get('/:id', getDepartment);

router.use(protect);
router.post('/', authorize('admin', 'super_admin'), createDepartment);
router.put('/:id', authorize('admin', 'super_admin'), updateDepartment);
router.delete('/:id', authorize('admin', 'super_admin'), deleteDepartment);

module.exports = router;
