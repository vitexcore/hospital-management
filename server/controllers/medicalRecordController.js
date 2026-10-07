const MedicalRecord = require('../models/MedicalRecord');
const { logActivity, getClientIP } = require('../utils/activityLogger');

exports.getMedicalRecords = async (req, res, next) => {
  try {
    const { patient, doctor, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;
    else {
      if (patient) query.patient = patient;
      if (doctor) query.doctor = doctor;
    }

    const total = await MedicalRecord.countDocuments(query);
    const records = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName')
      .populate('department', 'name')
      .populate('appointment', 'appointmentDate appointmentTime')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ visitDate: -1 });

    res.json({ success: true, count: records.length, total, totalPages: Math.ceil(total / limit), data: records });
  } catch (err) { next(err); }
};

exports.getMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName')
      .populate('department', 'name')
      .populate('appointment');

    if (!record) return res.status(404).json({ success: false, message: 'Medical record not found' });

    if (req.user.role === 'patient' && record.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.createMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.create({ ...req.body, doctor: req.user._id });
    const populated = await MedicalRecord.findById(record._id)
      .populate('patient', 'firstName lastName').populate('doctor', 'firstName lastName');

    await logActivity({
      user: req.user, action: 'create_medical_record', module: 'medical_record',
      targetModel: 'MedicalRecord', targetId: record._id, targetName: record.recordId,
      description: `Medical record created by Dr. ${req.user.firstName} ${req.user.lastName}`,
      ipAddress: getClientIP(req)
    });

    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

exports.updateMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    if (req.user.role === 'doctor' && record.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'firstName lastName').populate('doctor', 'firstName lastName');

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};
