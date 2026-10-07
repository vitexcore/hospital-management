const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, unique: true },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'insurance', 'online', 'cheque'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: { type: String },
  referenceNumber: { type: String },
  paidAt: { type: Date },
  refundedAt: { type: Date },
  refundAmount: { type: Number, default: 0 },
  refundReason: { type: String },
  notes: { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiptSent: { type: Boolean, default: false }
}, { timestamps: true });

paymentSchema.pre('save', async function (next) {
  if (!this.paymentId) {
    const count = await mongoose.model('Payment').countDocuments();
    this.paymentId = `PAY-${String(count + 1).padStart(7, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
