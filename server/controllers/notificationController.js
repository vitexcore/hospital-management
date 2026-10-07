const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const { isRead, page = 1, limit = 20 } = req.query;
    const query = { recipient: req.user._id };
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    const notifications = await Notification.find(query)
      .populate('sender', 'firstName lastName avatar')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, count: notifications.length, total, unreadCount, data: notifications });
  } catch (err) { next(err); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: Date.now() });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) { next(err); }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: Date.now() });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
};

exports.createSystemNotification = async (req, res, next) => {
  try {
    const { recipients, title, message, priority = 'medium' } = req.body;
    const notifications = await Notification.insertMany(
      recipients.map(r => ({ recipient: r, type: 'system_announcement', title, message, priority, sender: req.user._id }))
    );
    res.status(201).json({ success: true, count: notifications.length, message: 'Notifications sent' });
  } catch (err) { next(err); }
};
