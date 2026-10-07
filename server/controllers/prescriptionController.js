const Prescription = require('../models/Prescription');
const { createNotification } = require('../services/notificationService');
const { logActivity, getClientIP } = require('../utils/activityLogger');

exports.getPrescriptions = async (req, res, next) => {
  try {
    const { patient, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;
    else if (patient) query.patient = patient;

    if (status) query.status = status;

    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, count: prescriptions.length, total, totalPages: Math.ceil(total / limit), data: prescriptions });
  } catch (err) { next(err); }
};

exports.getPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName');

    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    if (req.user.role === 'patient' && prescription.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: prescription });
  } catch (err) { next(err); }
};

exports.createPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.create({ ...req.body, doctor: req.user._id });

    await createNotification({
      recipient: req.body.patient, sender: req.user._id,
      type: 'prescription_created',
      title: 'New Prescription Issued',
      message: `Dr. ${req.user.firstName} ${req.user.lastName} has issued a new prescription for you.`,
      link: '/dashboard/prescriptions',
      data: { prescriptionId: prescription._id }
    });

    await logActivity({
      user: req.user, action: 'create_prescription', module: 'prescription',
      targetModel: 'Prescription', targetId: prescription._id, targetName: prescription.prescriptionId,
      description: `Prescription created by Dr. ${req.user.firstName} ${req.user.lastName}`,
      ipAddress: getClientIP(req)
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('patient', 'firstName lastName').populate('doctor', 'firstName lastName');

    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

exports.updatePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'firstName lastName').populate('doctor', 'firstName lastName');

    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.json({ success: true, data: prescription });
  } catch (err) { next(err); }
};
