const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const { logActivity, getClientIP } = require('../utils/activityLogger');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res, next) => {
  try {
    const { search, department, specialization, page = 1, limit = 12, isAvailable } = req.query;
    const query = {};

    if (department) query.department = department;
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

    let userQuery = { role: 'doctor', isActive: true };
    if (search) {
      userQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(userQuery).select('_id');
    if (search) query.user = { $in: users.map(u => u._id) };

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .populate('user', '-password')
      .populate('department', 'name slug')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: doctors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: doctors
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.id })
      .populate('user', '-password')
      .populate('department', 'name description');

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

// @desc    Create doctor (admin)
// @route   POST /api/doctors
// @access  Private (admin, super_admin)
exports.createDoctor = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, specialization, department, consultationFee, experience, biography, licenseNumber, qualifications, schedule } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      firstName, lastName, email,
      password: password || `Doctor${Math.random().toString(36).slice(-8)}@`,
      phone, role: 'doctor'
    });

    const doctor = await Doctor.create({
      user: user._id, specialization, department, consultationFee, experience,
      biography, licenseNumber, qualifications, schedule
    });

    if (department) {
      await Department.findByIdAndUpdate(department, { $addToSet: { doctors: doctor._id } });
    }

    await logActivity({
      user: req.user,
      action: 'create_doctor',
      module: 'doctor',
      targetModel: 'Doctor',
      targetId: doctor._id,
      targetName: `Dr. ${user.fullName}`,
      description: `Doctor created by ${req.user.fullName}: Dr. ${user.fullName}`,
      ipAddress: getClientIP(req)
    });

    const populated = await Doctor.findById(doctor._id).populate('user', '-password').populate('department', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (admin, doctor self)
exports.updateDoctor = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, ...doctorFields } = req.body;

    const doctor = await Doctor.findOne({ user: req.params.id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    if (req.user.role === 'doctor' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await User.findByIdAndUpdate(req.params.id, { firstName, lastName, phone });

    if (doctorFields.department && doctorFields.department !== doctor.department?.toString()) {
      await Department.findByIdAndUpdate(doctor.department, { $pull: { doctors: doctor._id } });
      await Department.findByIdAndUpdate(doctorFields.department, { $addToSet: { doctors: doctor._id } });
    }

    const updated = await Doctor.findOneAndUpdate(
      { user: req.params.id },
      doctorFields,
      { new: true, runValidators: true }
    ).populate('user', '-password').populate('department', 'name');

    await logActivity({
      user: req.user,
      action: 'update_doctor',
      module: 'doctor',
      targetModel: 'Doctor',
      targetId: doctor._id,
      targetName: `Dr. ${updated.user.fullName}`,
      description: `Doctor profile updated by ${req.user.fullName}`,
      ipAddress: getClientIP(req)
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete/deactivate doctor
// @route   DELETE /api/doctors/:id
// @access  Private (admin, super_admin)
exports.deleteDoctor = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!user) return res.status(404).json({ success: false, message: 'Doctor not found' });

    await logActivity({
      user: req.user,
      action: 'deactivate_doctor',
      module: 'doctor',
      description: `Doctor deactivated: ${user.fullName}`,
      ipAddress: getClientIP(req)
    });

    res.json({ success: true, message: 'Doctor account deactivated' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get doctor availability slots
// @route   GET /api/doctors/:id/slots
// @access  Public
exports.getDoctorSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    const doctor = await Doctor.findOne({ user: req.params.id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = doctor.schedule?.find(s => s.day === dayName);

    if (!daySchedule || !daySchedule.isAvailable) {
      return res.json({ success: true, data: [] });
    }

    const existingAppointments = await Appointment.find({
      doctor: req.params.id,
      appointmentDate: new Date(date),
      status: { $nin: ['cancelled', 'no-show'] }
    }).select('appointmentTime');

    const bookedTimes = existingAppointments.map(a => a.appointmentTime);

    const slots = [];
    const [startH, startM] = daySchedule.startTime.split(':').map(Number);
    const [endH, endM] = daySchedule.endTime.split(':').map(Number);

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + 30 <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      const timeStr = `${h}:${m}`;
      const isBooked = bookedTimes.includes(timeStr);
      slots.push({ time: timeStr, isAvailable: !isBooked });
      current += 30;
    }

    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
};
