const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const { createNotification } = require('../services/notificationService');
const { logActivity, getClientIP } = require('../utils/activityLogger');

// INVOICES
exports.getInvoices = async (req, res, next) => {
  try {
    const { patient, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (patient) query.patient = patient;
    if (status) query.status = status;

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName')
      .populate('appointment', 'appointmentDate appointmentId')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invoices.length, total, totalPages: Math.ceil(total / limit), data: invoices });
  } catch (err) { next(err); }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName')
      .populate('appointment');

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    if (req.user.role === 'patient' && invoice.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const { items, taxRate = 0, discount = 0, ...rest } = req.body;
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax - discount;

    const invoice = await Invoice.create({ items, subtotal, tax, taxRate, discount, total, balance: total, createdBy: req.user._id, ...rest });

    await logActivity({
      user: req.user, action: 'create_invoice', module: 'invoice',
      targetModel: 'Invoice', targetId: invoice._id, targetName: invoice.invoiceId,
      description: `Invoice created: ${invoice.invoiceId} - $${total}`,
      ipAddress: getClientIP(req)
    });

    const populated = await Invoice.findById(invoice._id).populate('patient', 'firstName lastName');
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('patient', 'firstName lastName');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

// PAYMENTS
exports.getPayments = async (req, res, next) => {
  try {
    const { patient, status, method, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (patient) query.patient = patient;
    if (status) query.status = status;
    if (method) query.method = method;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('invoice', 'invoiceId total')
      .populate('processedBy', 'firstName lastName')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, total, totalPages: Math.ceil(total / limit), data: payments });
  } catch (err) { next(err); }
};

exports.createPayment = async (req, res, next) => {
  try {
    const { invoice: invoiceId, amount, method, transactionId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const payment = await Payment.create({
      invoice: invoiceId, patient: invoice.patient, amount, method,
      transactionId, status: 'paid', paidAt: Date.now(), processedBy: req.user._id
    });

    invoice.amountPaid += amount;
    invoice.balance = invoice.total - invoice.amountPaid;
    invoice.status = invoice.balance <= 0 ? 'paid' : invoice.amountPaid > 0 ? 'partial' : invoice.status;
    await invoice.save();

    await createNotification({
      recipient: invoice.patient,
      type: 'payment_received',
      title: 'Payment Received',
      message: `Payment of $${amount} received for invoice ${invoice.invoiceId}.`,
      link: '/dashboard/payments',
      data: { paymentId: payment._id }
    });

    await logActivity({
      user: req.user, action: 'process_payment', module: 'payment',
      description: `Payment processed: $${amount} for invoice ${invoice.invoiceId}`,
      ipAddress: getClientIP(req)
    });

    const populated = await Payment.findById(payment._id).populate('patient', 'firstName lastName').populate('invoice', 'invoiceId total');
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

exports.getRevenueStats = async (req, res, next) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, data: { totalRevenue: totalRevenue[0]?.total || 0, monthlyRevenue } });
  } catch (err) { next(err); }
};
