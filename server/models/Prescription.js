const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: { type: String },
  dosage: { type: String, required: true },
  form: { type: String, enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other'], default: 'tablet' },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String },
  quantity: { type: Number },
  refills: { type: Number, default: 0 }
});

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  medicalRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' },
  medications: [medicationSchema],
  diagnosis: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['active', 'completed', 'cancelled', 'expired'], default: 'active' },
  issuedDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  dispensedBy: { type: String },
  dispensedAt: { type: Date }
}, { timestamps: true });

prescriptionSchema.pre('save', async function (next) {
  if (!this.prescriptionId) {
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionId = `RX-${String(count + 1).padStart(7, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
