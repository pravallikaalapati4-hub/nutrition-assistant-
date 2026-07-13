const Progress = require('../models/Progress');
const Client = require('../models/Client');
const { asyncHandler } = require('../middleware/errorHandler');
const { canAccessClient } = require('./clientController');

// @route  POST /api/progress
// @access Private
exports.logProgress = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.body.client);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  if (!canAccessClient(req.user, client)) {
    return res.status(403).json({ success: false, message: 'Not authorized to log progress for this client' });
  }

  const progress = await Progress.create(req.body);
  res.status(201).json({ success: true, progress });
});

// @route  GET /api/progress?client=<id>&from=<date>&to=<date>
// @access Private
exports.listProgress = asyncHandler(async (req, res) => {
  const { client, from, to } = req.query;
  if (!client) {
    return res.status(400).json({ success: false, message: 'client query parameter is required' });
  }

  const clientDoc = await Client.findById(client);
  if (!clientDoc) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  if (!canAccessClient(req.user, clientDoc)) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this progress data' });
  }

  const filter = { client };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const entries = await Progress.find(filter).sort({ date: 1 });
  res.status(200).json({ success: true, count: entries.length, entries });
});

// @route  GET /api/progress/:id
// @access Private
exports.getProgressEntry = asyncHandler(async (req, res) => {
  const entry = await Progress.findById(req.params.id).populate('client');
  if (!entry) {
    return res.status(404).json({ success: false, message: 'Progress entry not found' });
  }

  if (!canAccessClient(req.user, entry.client)) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this entry' });
  }

  res.status(200).json({ success: true, entry });
});

// @route  PUT /api/progress/:id
// @access Private
exports.updateProgressEntry = asyncHandler(async (req, res) => {
  const entry = await Progress.findById(req.params.id).populate('client');
  if (!entry) {
    return res.status(404).json({ success: false, message: 'Progress entry not found' });
  }

  if (!canAccessClient(req.user, entry.client)) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this entry' });
  }

  Object.assign(entry, req.body);
  await entry.save();
  res.status(200).json({ success: true, entry });
});

// @route  DELETE /api/progress/:id
// @access Private
exports.deleteProgressEntry = asyncHandler(async (req, res) => {
  const entry = await Progress.findById(req.params.id).populate('client');
  if (!entry) {
    return res.status(404).json({ success: false, message: 'Progress entry not found' });
  }

  if (!canAccessClient(req.user, entry.client)) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this entry' });
  }

  await entry.deleteOne();
  res.status(200).json({ success: true, message: 'Progress entry deleted' });
});

// @route  GET /api/progress/:client/summary
// @access Private - lightweight aggregate stats for dashboard charts
exports.getProgressSummary = asyncHandler(async (req, res) => {
  const clientDoc = await Client.findById(req.params.client);
  if (!clientDoc) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  if (!canAccessClient(req.user, clientDoc)) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this data' });
  }

  const entries = await Progress.find({ client: req.params.client }).sort({ date: 1 });

  const avgAdherence =
    entries.length > 0
      ? entries.reduce((sum, e) => sum + (e.adherencePercent || 0), 0) / entries.length
      : 0;

  res.status(200).json({
    success: true,
    entryCount: entries.length,
    averageAdherence: Math.round(avgAdherence * 100) / 100,
    weightTrend: entries.map((e) => ({ date: e.date, weightKg: e.weightKg })),
    calorieTrend: entries.map((e) => ({ date: e.date, caloriesConsumed: e.caloriesConsumed })),
  });
});
