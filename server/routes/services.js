const express = require('express');
const router = express.Router();
const { getServices, getService, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getServices);
router.get('/:id', getService);
router.use(protect);
router.post('/', authorize('admin', 'super_admin'), createService);
router.put('/:id', authorize('admin', 'super_admin'), updateService);
router.delete('/:id', authorize('admin', 'super_admin'), deleteService);

module.exports = router;
