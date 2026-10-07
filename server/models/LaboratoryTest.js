const mongoose = require('mongoose');

const labResultItemSchema = new mongoose.Schema({
  parameter: { type: String, required: true },
  value: { type: String, required: true },
  unit: { type: String },
  referenceRange: { type: String },
  status: { type: String, enum: ['normal', 'high', 'low', 'critical'], default: 'normal' },
  notes: { type: String }
});

const laboratoryTestSchema = new mongoose.Schema({
  labId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // doctor
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  medicalRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' },
  testName: { type: String, required: true },
  testCode: { type: String },
  category: { type: String, enum: ['blood', 'urine', 'stool', 'imaging', 'microbiology', 'pathology', 'other'], default: 'blood' },
  priority: { type: String, enum: ['routine', 'urgent', 'stat'], default: 'routine' },
  clinicalInfo: { type: String },
  status: {
    type: String,
    enum: ['requested', 'sample-collected', 'processing', 'completed', 'cancelled'],
    default: 'requested'
  },
  requestedDate: { type: Date, default: Date.now },
  sampleCollectedAt: { type: Date },
  processedAt: { type: Date },
  completedAt: { type: Date },
  results: [labResultItemSchema],
  summary: { type: String },
  interpretation: { type: String },
  reportFile: { type: String },
  processedBy: { type: String },
  verifiedBy: { type: String },
  price: { type: Number, default: 0 }
}, { timestamps: true });

laboratoryTestSchema.pre('save', async function (next) {
  if (!this.labId) {
    const count = await mongoose.model('LaboratoryTest').countDocuments();
    this.labId = `LAB-${String(count + 1).padStart(7, '0')}`;
  }
  next();
});

module.exports = mongoose.model('LaboratoryTest', laboratoryTestSchema);
