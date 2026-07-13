const express = require('express');
const router = express.Router();
const {
  getUser,
  updateUser,
  listUsers,
  approveDietitian,
  deactivateUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin'), listUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.put('/:id/approve', authorize('admin'), approveDietitian);
router.put('/:id/deactivate', authorize('admin'), deactivateUser);

module.exports = router;
