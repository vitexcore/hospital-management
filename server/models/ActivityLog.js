const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: { type: String, required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  module: {
    type: String,
    enum: ['auth', 'user', 'patient', 'doctor', 'department', 'service', 'appointment', 'medical_record', 'prescription', 'laboratory', 'invoice', 'payment', 'notification', 'system'],
    required: true
  },
  targetModel: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetName: { type: String },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  status: { type: String, enum: ['success', 'failed', 'warning'], default: 'success' }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
