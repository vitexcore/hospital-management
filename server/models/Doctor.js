const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema({
  day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
  startTime: String,
  endTime: String,
  isAvailable: { type: Boolean, default: true },
  maxAppointments: { type: Number, default: 10 }
});

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  doctorId: { type: String, unique: true },
  specialization: { type: String, required: [true, 'Specialization is required'] },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: { type: Number, default: 0 }, // years
  biography: { type: String },
  consultationFee: { type: Number, default: 0 },
  schedule: [scheduleSlotSchema],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  licenseNumber: { type: String },
  isAvailable: { type: Boolean, default: true },
  languages: [{ type: String }],
  awards: [{ type: String }],
  publications: [{ type: String }]
}, { timestamps: true });

doctorSchema.pre('save', async function (next) {
  if (!this.doctorId) {
    const count = await mongoose.model('Doctor').countDocuments();
    this.doctorId = `DOC-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);
