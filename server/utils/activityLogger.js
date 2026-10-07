const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({
  user,
  action,
  module,
  targetModel = null,
  targetId = null,
  targetName = null,
  description,
  metadata = {},
  ipAddress = null,
  userAgent = null,
  status = 'success'
}) => {
  try {
    await ActivityLog.create({
      user: user._id || user,
      userRole: user.role || 'unknown',
      userName: user.fullName || `${user.firstName} ${user.lastName}` || 'Unknown User',
      action,
      module,
      targetModel,
      targetId,
      targetName,
      description,
      metadata,
      ipAddress,
      userAgent,
      status
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
};

module.exports = { logActivity, getClientIP };
