const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  endTime: { type: String },
  duration: { type: Number, default: 30 }, // minutes
  type: { type: String, enum: ['consultation', 'follow-up', 'emergency', 'procedure', 'lab', 'imaging'], default: 'consultation' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'pending'
  },
  reason: { type: String, required: [true, 'Reason for visit is required'] },
  symptoms: { type: String },
  notes: { type: String },
  doctorNotes: { type: String },
  cancelReason: { type: String },
  rescheduleReason: { type: String },
  fee: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who booked (patient/receptionist)
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  confirmedAt: { type: Date },
  checkedInAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

appointmentSchema.pre('save', async function (next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT-${String(count + 1).padStart(7, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
