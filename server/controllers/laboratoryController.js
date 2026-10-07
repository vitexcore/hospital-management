const LaboratoryTest = require('../models/LaboratoryTest');
const { createNotification } = require('../services/notificationService');
const { logActivity, getClientIP } = require('../utils/activityLogger');

exports.getLabTests = async (req, res, next) => {
  try {
    const { patient, status, category, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.requestedBy = req.user._id;
    else {
      if (patient) query.patient = patient;
    }

    if (status) query.status = status;
    if (category) query.category = category;

    const total = await LaboratoryTest.countDocuments(query);
    const tests = await LaboratoryTest.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('requestedBy', 'firstName lastName')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tests.length, total, totalPages: Math.ceil(total / limit), data: tests });
  } catch (err) { next(err); }
};

exports.getLabTest = async (req, res, next) => {
  try {
    const test = await LaboratoryTest.findById(req.params.id)
      .populate('patient', 'firstName lastName email')
      .populate('requestedBy', 'firstName lastName');

    if (!test) return res.status(404).json({ success: false, message: 'Lab test not found' });

    if (req.user.role === 'patient' && test.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: test });
  } catch (err) { next(err); }
};

exports.requestLabTest = async (req, res, next) => {
  try {
    const test = await LaboratoryTest.create({ ...req.body, requestedBy: req.user._id });
    
    await logActivity({
      user: req.user, action: 'request_lab_test', module: 'laboratory',
      targetModel: 'LaboratoryTest', targetId: test._id, targetName: test.testName,
      description: `Lab test requested by Dr. ${req.user.firstName} ${req.user.lastName}: ${test.testName}`,
      ipAddress: getClientIP(req)
    });

    const populated = await LaboratoryTest.findById(test._id)
      .populate('patient', 'firstName lastName').populate('requestedBy', 'firstName lastName');

    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

exports.updateLabTest = async (req, res, next) => {
  try {
    const { status, results, summary, interpretation, processedBy, verifiedBy } = req.body;
    
    const updates = { status };
    if (results) updates.results = results;
    if (summary) updates.summary = summary;
    if (interpretation) updates.interpretation = interpretation;
    if (processedBy) updates.processedBy = processedBy;
    if (verifiedBy) updates.verifiedBy = verifiedBy;
    if (status === 'sample-collected') updates.sampleCollectedAt = Date.now();
    if (status === 'processing') updates.processedAt = Date.now();
    if (status === 'completed') updates.completedAt = Date.now();

    const test = await LaboratoryTest.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('patient', 'firstName lastName email')
      .populate('requestedBy', 'firstName lastName');

    if (!test) return res.status(404).json({ success: false, message: 'Lab test not found' });

    // Notify patient when results are ready
    if (status === 'completed') {
      await createNotification({
        recipient: test.patient._id,
        type: 'lab_result_ready',
        title: 'Lab Results Ready',
        message: `Your ${test.testName} results are now available.`,
        link: '/dashboard/laboratory',
        data: { labId: test._id },
        priority: 'high'
      });
    }

    await logActivity({
      user: req.user, action: 'update_lab_test', module: 'laboratory',
      description: `Lab test updated: ${test.testName} - Status: ${status}`,
      ipAddress: getClientIP(req)
    });

    res.json({ success: true, data: test });
  } catch (err) { next(err); }
};

exports.uploadLabReport = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const test = await LaboratoryTest.findByIdAndUpdate(
      req.params.id, { reportFile: req.file.filename }, { new: true }
    );
    res.json({ success: true, data: test, filename: req.file.filename });
  } catch (err) { next(err); }
};
