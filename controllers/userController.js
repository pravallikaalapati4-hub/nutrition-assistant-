const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @route  GET /api/users/:id
// @access Private (self, dietitian, or admin)
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @route  PUT /api/users/:id
// @access Private (self or admin)
exports.updateUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
  }

  // Prevent privilege escalation via this endpoint
  const { role, isApproved, isActive, password, ...safeUpdates } = req.body;

  const user = await User.findByIdAndUpdate(req.params.id, safeUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @route  GET /api/users
// @access Private (admin only)
exports.listUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const filter = role ? { role } : {};

  const users = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    users: users.map((u) => u.toSafeObject()),
  });
});

// @route  PUT /api/users/:id/approve
// @access Private (admin only) - approves a dietitian account
exports.approveDietitian = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'dietitian') {
    return res.status(404).json({ success: false, message: 'Dietitian not found' });
  }
  user.isApproved = true;
  await user.save();
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @route  PUT /api/users/:id/deactivate
// @access Private (admin only)
exports.deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, user: user.toSafeObject() });
});
