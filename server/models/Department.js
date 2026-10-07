const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Department name is required'], unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String },
  shortDescription: { type: String },
  icon: { type: String },
  image: { type: String },
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  services: [{ type: String }],
  phone: { type: String },
  email: { type: String },
  location: { type: String },
  openingHours: {
    weekdays: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String, isClosed: { type: Boolean, default: true } }
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

departmentSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Department', departmentSchema);
