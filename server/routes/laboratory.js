const express = require('express');
const router = express.Router();
const { getLabTests, getLabTest, requestLabTest, updateLabTest, uploadLabReport } = require('../controllers/laboratoryController');
const { protect, authorize } = require('../middleware/auth');
const { uploadLabReport: uploadFile } = require('../middleware/upload');

router.use(protect);
router.get('/', getLabTests);
router.post('/', authorize('doctor', 'admin', 'super_admin'), requestLabTest);
router.get('/:id', getLabTest);
router.put('/:id', authorize('admin', 'super_admin', 'receptionist'), updateLabTest);
router.post('/:id/upload', authorize('admin', 'super_admin', 'receptionist'), uploadFile, uploadLabReport);

module.exports = router;
