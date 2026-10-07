const express = require('express');
const router = express.Router();
const { getMedicalRecords, getMedicalRecord, createMedicalRecord, updateMedicalRecord } = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getMedicalRecords);
router.post('/', authorize('doctor', 'admin', 'super_admin'), createMedicalRecord);
router.get('/:id', getMedicalRecord);
router.put('/:id', authorize('doctor', 'admin', 'super_admin'), updateMedicalRecord);

module.exports = router;
