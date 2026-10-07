const express = require('express');
const router = express.Router();
const { getPatients, getPatient, updatePatient, deletePatient, registerPatient, getPatientStats } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', authorize('admin', 'super_admin'), getPatientStats);
router.post('/register', authorize('admin', 'super_admin', 'receptionist'), registerPatient);
router.get('/', authorize('admin', 'super_admin', 'doctor', 'receptionist'), getPatients);
router.get('/:id', getPatient);
router.put('/:id', updatePatient);
router.delete('/:id', authorize('admin', 'super_admin'), deletePatient);

module.exports = router;
