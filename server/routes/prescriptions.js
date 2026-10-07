const express = require('express');
const router = express.Router();
const { getPrescriptions, getPrescription, createPrescription, updatePrescription } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getPrescriptions);
router.post('/', authorize('doctor', 'admin', 'super_admin'), createPrescription);
router.get('/:id', getPrescription);
router.put('/:id', authorize('doctor', 'admin', 'super_admin'), updatePrescription);

module.exports = router;
