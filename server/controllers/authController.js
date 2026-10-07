const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { logActivity, getClientIP } = require('../utils/activityLogger');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  const userData = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token, user: userData });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, gender, dateOfBirth } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ firstName, lastName, email, password, phone, role: 'patient' });

    await Patient.create({ user: user._id, gender: gender || 'other', dateOfBirth: dateOfBirth || null });

    await logActivity({
      user,
      action: 'register',
      module: 'auth',
      targetModel: 'User',
      targetId: user._id,
      targetName: user.fullName,
      description: `New patient registered: ${user.fullName}`,
      ipAddress: getClientIP(req)
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    await logActivity({
      user,
      action: 'login',
      module: 'auth',
      description: `User logged in: ${user.fullName}`,
      ipAddress: getClientIP(req)
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    let profileData = null;
    if (user.role === 'patient') {
      profileData = await Patient.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      profileData = await Doctor.findOne({ user: user._id }).populate('department', 'name');
    }

    res.json({ success: true, user, profile: profileData });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });

    await logActivity({
      user: req.user,
      action: 'logout',
      module: 'auth',
      description: `User logged out: ${req.user.fullName}`,
      ipAddress: getClientIP(req)
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!await user.matchPassword(currentPassword)) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    await logActivity({
      user: req.user,
      action: 'update_password',
      module: 'auth',
      description: `Password updated by: ${req.user.fullName}`,
      ipAddress: getClientIP(req)
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
