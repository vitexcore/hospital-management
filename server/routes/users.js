const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.use(protect);

router.put('/profile', async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { firstName, lastName, phone }, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.post('/avatar', uploadAvatar, async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a file' });
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: req.file.filename }, { new: true }).select('-password');
    res.json({ success: true, data: user, filename: req.file.filename });
  } catch (err) { next(err); }
});

module.exports = router;
