const Service = require('../models/Service');
const { logActivity, getClientIP } = require('../utils/activityLogger');

exports.getServices = async (req, res, next) => {
  try {
    const { isActive, isFeatured, department, category } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (department) query.department = department;
    if (category) query.category = category;

    const services = await Service.find(query).populate('department', 'name').sort({ order: 1, name: 1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) { next(err); }
};

exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] }).populate('department', 'name');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
};

exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    await logActivity({ user: req.user, action: 'create_service', module: 'service', targetModel: 'Service', targetId: service._id, targetName: service.name, description: `Service created: ${service.name}`, ipAddress: getClientIP(req) });
    res.status(201).json({ success: true, data: service });
  } catch (err) { next(err); }
};

exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    await logActivity({ user: req.user, action: 'update_service', module: 'service', description: `Service updated: ${service.name}`, ipAddress: getClientIP(req) });
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) { next(err); }
};
