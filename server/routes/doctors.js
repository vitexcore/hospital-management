const express = require('express');
const router = express.Router();
const { getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor, getDoctorSlots } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.get('/:id/slots', getDoctorSlots);

// Protected routes
router.use(protect);
router.post('/', authorize('admin', 'super_admin'), createDoctor);
router.put('/:id', authorize('admin', 'super_admin', 'doctor'), updateDoctor);
router.delete('/:id', authorize('admin', 'super_admin'), deleteDoctor);

module.exports = router;
