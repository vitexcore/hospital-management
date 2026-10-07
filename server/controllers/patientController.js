const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const { logActivity, getClientIP } = require('../utils/activityLogger');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (admin, super_admin, doctor, receptionist)
exports.getPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10, gender, bloodGroup } = req.query;
    const query = {};

    const userQuery = { role: 'patient' };
    if (search) {
      userQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(userQuery).select('-password');
    const userIds = users.map(u => u._id);

    if (gender) query.gender = gender;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    query.user = { $in: userIds };

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .populate('user', '-password')
      .populate('registeredBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: patients.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: patients
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.params.id }).populate('user', '-password');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // Patients can only see their own data
    if (req.user.role === 'patient' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, ...patientFields } = req.body;

    if (req.user.role === 'patient' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findByIdAndUpdate(req.params.id,
      { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(phone && { phone }) },
      { new: true, runValidators: true }
    ).select('-password');

    const patient = await Patient.findOneAndUpdate(
      { user: req.params.id },
      patientFields,
      { new: true, runValidators: true }
    ).populate('user', '-password');

    await logActivity({
      user: req.user,
      action: 'update_patient',
      module: 'patient',
      targetModel: 'Patient',
      targetId: patient._id,
      targetName: user.fullName,
      description: `Patient profile updated: ${user.fullName}`,
      ipAddress: getClientIP(req)
    });

    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

// @desc    Get patient stats (for admin)
// @route   GET /api/patients/stats
// @access  Private (admin)
exports.getPatientStats = async (req, res, next) => {
  try {
    const total = await Patient.countDocuments();
    const newThisMonth = await Patient.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });
    const genderStats = await Patient.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    const bloodGroupStats = await Patient.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data: { total, newThisMonth, genderStats, bloodGroupStats } });
  } catch (err) {
    next(err);
  }
};

// @desc    Register patient by receptionist/admin
// @route   POST /api/patients/register
// @access  Private (receptionist, admin)
exports.registerPatient = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, gender, dateOfBirth, ...patientData } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const tempPassword = `Medicare${Math.random().toString(36).slice(-8)}@`;
    const user = await User.create({ firstName, lastName, email, password: tempPassword, phone, role: 'patient' });
    const patient = await Patient.create({ user: user._id, gender, dateOfBirth, registeredBy: req.user._id, ...patientData });

    await logActivity({
      user: req.user,
      action: 'register_patient',
      module: 'patient',
      targetModel: 'Patient',
      targetId: patient._id,
      targetName: user.fullName,
      description: `Patient registered by ${req.user.fullName}: ${user.fullName}`,
      ipAddress: getClientIP(req)
    });

    const populatedPatient = await Patient.findById(patient._id).populate('user', '-password');
    res.status(201).json({ success: true, data: populatedPatient, tempPassword });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete/deactivate patient
// @route   DELETE /api/patients/:id
// @access  Private (admin, super_admin)
exports.deletePatient = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!user) return res.status(404).json({ success: false, message: 'Patient not found' });

    await logActivity({
      user: req.user,
      action: 'deactivate_patient',
      module: 'patient',
      targetModel: 'User',
      targetId: user._id,
      targetName: user.fullName,
      description: `Patient deactivated by ${req.user.fullName}: ${user.fullName}`,
      ipAddress: getClientIP(req)
    });

    res.json({ success: true, message: 'Patient account deactivated' });
  } catch (err) {
    next(err);
  }
};
