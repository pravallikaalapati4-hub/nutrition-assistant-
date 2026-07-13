const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const { asyncHandler } = require('../middleware/errorHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendAuthResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
};

// @route  POST /api/auth/register
// @access Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Only allow self-registration as 'user' or 'dietitian'; admins are created separately
  const safeRole = ['user', 'dietitian'].includes(role) ? role : 'user';

  const user = await User.create({ name, email, password, role: safeRole });

  // Auto-create a Client profile for regular users so they can immediately track nutrition
  if (safeRole === 'user') {
    await Client.create({ user: user._id });
  }

  sendAuthResponse(user, 201, res);
});

// @route  POST /api/auth/login
// @access Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account has been deactivated' });
  }

  sendAuthResponse(user, 200, res);
});

// @route  GET /api/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

// @route  PUT /api/auth/update-password
// @access Private
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  sendAuthResponse(user, 200, res);
});
