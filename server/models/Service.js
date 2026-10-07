const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Service name is required'], unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  category: { type: String },
  description: { type: String },
  shortDescription: { type: String },
  icon: { type: String },
  image: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  price: { type: Number, default: 0 },
  duration: { type: Number, default: 30 }, // minutes
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  features: [{ type: String }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

serviceSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
