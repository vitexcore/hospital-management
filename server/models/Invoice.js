const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  type: { type: String, enum: ['consultation', 'procedure', 'lab', 'medication', 'room', 'other'], default: 'other' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
  serviceRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }
});

const invoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'],
    default: 'pending'
  },
  dueDate: { type: Date },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  insurance: {
    provider: String,
    policyNumber: String,
    coverage: Number
  }
}, { timestamps: true });

invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceId) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceId = `INV-${String(count + 1).padStart(7, '0')}`;
  }
  this.balance = this.total - this.amountPaid;
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
