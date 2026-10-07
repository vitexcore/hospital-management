const express = require('express');
const router = express.Router();
const { getAppointments, getAppointment, createAppointment, updateAppointmentStatus, rescheduleAppointment, getTodayAppointments, getAppointmentStats } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', authorize('admin', 'super_admin'), getAppointmentStats);
router.get('/today', authorize('admin', 'super_admin', 'doctor', 'receptionist'), getTodayAppointments);
router.get('/', getAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.patch('/:id/reschedule', rescheduleAppointment);

module.exports = router;
