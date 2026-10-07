const ActivityLog = require('../models/ActivityLog');

exports.getActivityLogs = async (req, res, next) => {
  try {
    const { user, module, action, status, search, page = 1, limit = 20, startDate, endDate } = req.query;
    const query = {};

    if (user) query.user = user;
    if (module) query.module = module;
    if (action) query.action = { $regex: action, $options: 'i' };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('user', 'firstName lastName email role')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, count: logs.length, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), data: logs });
  } catch (err) { next(err); }
};
