const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const { logActivity, getClientIP } = require('../utils/activityLogger');

exports.getDepartments = async (req, res, next) => {
  try {
    const { isActive, page = 1, limit = 20 } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const departments = await Department.find(query)
      .populate({ path: 'doctors', populate: { path: 'user', select: 'firstName lastName avatar' } })
      .populate({ path: 'head', populate: { path: 'user', select: 'firstName lastName' } })
      .sort({ order: 1, name: 1 });

    res.json({ success: true, count: departments.length, data: departments });
  } catch (err) { next(err); }
};

exports.getDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] })
      .populate({ path: 'doctors', populate: { path: 'user', select: 'firstName lastName avatar' } })
      .populate({ path: 'head', populate: { path: 'user', select: 'firstName lastName' } });

    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, data: dept });
  } catch (err) { next(err); }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const dept = await Department.create(req.body);
    await logActivity({
      user: req.user, action: 'create_department', module: 'department',
      targetModel: 'Department', targetId: dept._id, targetName: dept.name,
      description: `Department created: ${dept.name}`, ipAddress: getClientIP(req)
    });
    res.status(201).json({ success: true, data: dept });
  } catch (err) { next(err); }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    await logActivity({
      user: req.user, action: 'update_department', module: 'department',
      targetModel: 'Department', targetId: dept._id, targetName: dept.name,
      description: `Department updated: ${dept.name}`, ipAddress: getClientIP(req)
    });
    res.json({ success: true, data: dept });
  } catch (err) { next(err); }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    await logActivity({
      user: req.user, action: 'delete_department', module: 'department',
      description: `Department deleted: ${dept.name}`, ipAddress: getClientIP(req)
    });
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) { next(err); }
};
