const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  visitDate: { type: Date, required: true, default: Date.now },
  chiefComplaint: { type: String },
  symptoms: [{ type: String }],
  diagnosis: { type: String, required: true },
  diagnosisCode: { type: String }, // ICD-10 code
  treatment: { type: String },
  treatmentPlan: { type: String },
  clinicalNotes: { type: String },
  vitals: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    bmi: Number
  },
  followUpDate: { type: Date },
  followUpNotes: { type: String },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isConfidential: { type: Boolean, default: false }
}, { timestamps: true });

medicalRecordSchema.pre('save', async function (next) {
  if (!this.recordId) {
    const count = await mongoose.model('MedicalRecord').countDocuments();
    this.recordId = `MR-${String(count + 1).padStart(7, '0')}`;
  }
  next();
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
