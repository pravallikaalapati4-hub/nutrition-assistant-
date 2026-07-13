const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  logProgress,
  listProgress,
  getProgressEntry,
  updateProgressEntry,
  deleteProgressEntry,
  getProgressSummary,
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router
  .route('/')
  .post([body('client').notEmpty().withMessage('client is required')], validate, logProgress)
  .get(listProgress);

router.get('/:client/summary', getProgressSummary);

router.route('/:id').get(getProgressEntry).put(updateProgressEntry).delete(deleteProgressEntry);

module.exports = router;
