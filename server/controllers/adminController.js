const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const LaboratoryTest = require('../models/LaboratoryTest');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin, super_admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalPatients, totalDoctors, totalStaff,
      todayAppointments, pendingAppointments, completedAppointments, cancelledAppointments,
      totalRevenue, newPatientsThisMonth
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      User.countDocuments({ role: { $in: ['receptionist', 'admin'] } }),
      Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Patient.countDocuments({ createdAt: { $gte: thisMonth } })
    ]);

    // 6-month appointment trends
    const appointmentTrends = await Appointment.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' }, status: '$status' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Revenue by month
    const revenueByMonth = await Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Patient registrations by month
    const patientGrowth = await User.aggregate([
      { $match: { role: 'patient', createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Appointment status distribution
    const statusDistribution = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalPatients,
          totalDoctors,
          totalStaff,
          todayAppointments,
          pendingAppointments,
          completedAppointments,
          cancelledAppointments,
          totalRevenue: totalRevenue[0]?.total || 0,
          newPatientsThisMonth
        },
        charts: {
          appointmentTrends,
          revenueByMonth,
          patientGrowth,
          statusDistribution
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin, super_admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, isActive, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, total, totalPages: Math.ceil(total / limit), data: users });
  } catch (err) { next(err); }
};

// @desc    Update user (admin)
// @route   PUT /api/admin/users/:id
// @access  Private (admin, super_admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { password, ...updates } = req.body; // Never allow password change this way
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};
