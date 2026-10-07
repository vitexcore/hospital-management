const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: [
      'appointment_confirmed', 'appointment_cancelled', 'appointment_reminder',
      'appointment_rescheduled', 'prescription_created', 'lab_result_ready',
      'payment_received', 'payment_due', 'system_announcement', 'general'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  link: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
