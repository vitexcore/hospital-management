const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { createNotification, notificationTemplates } = require('../services/notificationService');
const { logActivity, getClientIP } = require('../utils/activityLogger');

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    const { status, doctor, department, patient, date, page = 1, limit = 10, search } = req.query;
    const query = {};

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;
    else {
      if (patient) query.patient = patient;
      if (doctor) query.doctor = doctor;
    }

    if (status) query.status = status;
    if (department) query.department = department;
    if (date) {
      const d = new Date(date);
      query.appointmentDate = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }

    if (search) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = users.map(u => u._id);
      query.$or = [{ patient: { $in: userIds } }, { doctor: { $in: userIds } }];
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone avatar')
      .populate('doctor', 'firstName lastName email avatar')
      .populate('department', 'name')
      .populate('service', 'name price')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ appointmentDate: -1, createdAt: -1 });

    res.json({
      success: true, count: appointments.length, total,
      totalPages: Math.ceil(total / limit), currentPage: parseInt(page),
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', '-password')
      .populate('doctor', '-password')
      .populate('department', 'name')
      .populate('service', 'name price');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res, next) => {
  try {
    const { doctor, department, service, appointmentDate, appointmentTime, reason, symptoms, type, fee } = req.body;
    const patientId = req.user.role === 'patient' ? req.user._id : req.body.patient;

    const doctorUser = await User.findById(doctor);
    if (!doctorUser) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const appointment = await Appointment.create({
      patient: patientId, doctor, department, service,
      appointmentDate: new Date(appointmentDate), appointmentTime,
      reason, symptoms, type: type || 'consultation',
      fee, bookedBy: req.user._id
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName')
      .populate('department', 'name');

    // Send notifications
    await createNotification({
      recipient: patientId,
      type: 'appointment_confirmed',
      title: 'Appointment Booked',
      message: `Your appointment with Dr. ${doctorUser.firstName} ${doctorUser.lastName} on ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime} has been booked.`,
      link: '/dashboard/appointments',
      data: { appointmentId: appointment._id }
    });

    await logActivity({
      user: req.user,
      action: 'create_appointment',
      module: 'appointment',
      targetModel: 'Appointment',
      targetId: appointment._id,
      targetName: appointment.appointmentId,
      description: `Appointment booked by ${req.user.fullName}`,
      ipAddress: getClientIP(req)
    });

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes, cancelReason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const updates = { status };
    if (notes) updates.doctorNotes = notes;
    if (cancelReason) updates.cancelReason = cancelReason;
    if (status === 'confirmed') { updates.confirmedBy = req.user._id; updates.confirmedAt = Date.now(); }
    if (status === 'completed') updates.completedAt = Date.now();

    const updated = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName')
      .populate('department', 'name');

    // Notify patient on status changes
    if (status === 'confirmed') {
      await createNotification({
        recipient: appointment.patient._id,
        type: 'appointment_confirmed',
        title: 'Appointment Confirmed',
        message: `Your appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} has been confirmed.`,
        link: '/dashboard/appointments',
        data: { appointmentId: appointment._id },
        priority: 'high'
      });
    } else if (status === 'cancelled') {
      await createNotification({
        recipient: appointment.patient._id,
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: `Your appointment has been cancelled. ${cancelReason ? 'Reason: ' + cancelReason : ''}`,
        link: '/dashboard/appointments',
        data: { appointmentId: appointment._id },
        priority: 'high'
      });
    }

    await logActivity({
      user: req.user,
      action: `appointment_${status}`,
      module: 'appointment',
      targetModel: 'Appointment',
      targetId: appointment._id,
      description: `Appointment status changed to ${status} by ${req.user.fullName}`,
      ipAddress: getClientIP(req)
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Reschedule appointment
// @route   PATCH /api/appointments/:id/reschedule
// @access  Private
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime, rescheduleReason } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, {
      appointmentDate: new Date(appointmentDate), appointmentTime,
      rescheduleReason, status: 'pending'
    }, { new: true }).populate('patient', 'firstName lastName').populate('doctor', 'firstName lastName');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    await createNotification({
      recipient: appointment.patient._id,
      type: 'appointment_rescheduled',
      title: 'Appointment Rescheduled',
      message: `Your appointment with Dr. ${appointment.doctor.firstName} has been rescheduled to ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime}.`,
      link: '/dashboard/appointments',
      priority: 'high'
    });

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// @desc    Get today's appointments
// @route   GET /api/appointments/today
// @access  Private (doctor, receptionist, admin)
exports.getTodayAppointments = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);

    const query = { appointmentDate: { $gte: today, $lt: tomorrow } };
    if (req.user.role === 'doctor') query.doctor = req.user._id;

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone avatar')
      .populate('doctor', 'firstName lastName')
      .populate('department', 'name')
      .sort({ appointmentTime: 1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    next(err);
  }
};

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private (admin, super_admin)
exports.getAppointmentStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);

    const [total, todayCount, pending, confirmed, completed, cancelled] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' })
    ]);

    // Monthly chart data (last 6 months)
    const monthlyData = await Appointment.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, data: { total, todayCount, pending, confirmed, completed, cancelled, monthlyData } });
  } catch (err) {
    next(err);
  }
};
