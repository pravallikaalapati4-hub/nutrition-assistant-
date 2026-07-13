const express = require('express');
const router = express.Router();
const {
  createClient,
  listClients,
  getClient,
  updateClient,
  assignDietitian,
  deleteClient,
} = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').post(authorize('dietitian', 'admin'), createClient).get(listClients);

router.route('/:id').get(getClient).put(updateClient).delete(authorize('admin'), deleteClient);

router.put('/:id/assign', authorize('admin'), assignDietitian);

module.exports = router;
