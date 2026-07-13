const Client = require('../models/Client');
const { asyncHandler } = require('../middleware/errorHandler');

// Helper: checks if req.user may access a given client document
const canAccessClient = (user, client) => {
  if (user.role === 'admin') return true;
  if (client.dietitian && client.dietitian.toString() === user._id.toString()) return true;
  if (client.user.toString() === user._id.toString()) return true;
  return false;
};

// @route  POST /api/clients
// @access Private (dietitian, admin)
exports.createClient = asyncHandler(async (req, res) => {
  const client = await Client.create(req.body);
  res.status(201).json({ success: true, client });
});

// @route  GET /api/clients
// @access Private (dietitian sees their own clients, admin sees all)
exports.listClients = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'dietitian') {
    filter.dietitian = req.user._id;
  } else if (req.user.role === 'user') {
    filter.user = req.user._id;
  }

  const clients = await Client.find(filter)
    .populate('user', 'name email profile')
    .populate('dietitian', 'name email');

  res.status(200).json({ success: true, count: clients.length, clients });
});

// @route  GET /api/clients/:id
// @access Private (self, assigned dietitian, admin)
exports.getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id)
    .populate('user', 'name email profile')
    .populate('dietitian', 'name email');

  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  if (!canAccessClient(req.user, client)) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this client' });
  }

  res.status(200).json({ success: true, client });
});

// @route  PUT /api/clients/:id
// @access Private (assigned dietitian, admin)
exports.updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  if (!canAccessClient(req.user, client) || req.user.role === 'user') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this client' });
  }

  Object.assign(client, req.body);
  await client.save();

  res.status(200).json({ success: true, client });
});

// @route  PUT /api/clients/:id/assign
// @access Private (admin only) - assigns a dietitian to a client
exports.assignDietitian = asyncHandler(async (req, res) => {
  const { dietitianId } = req.body;
  const client = await Client.findByIdAndUpdate(
    req.params.id,
    { dietitian: dietitianId },
    { new: true }
  );

  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  res.status(200).json({ success: true, client });
});

// @route  DELETE /api/clients/:id
// @access Private (admin only)
exports.deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }
  res.status(200).json({ success: true, message: 'Client deleted' });
});

exports.canAccessClient = canAccessClient;
