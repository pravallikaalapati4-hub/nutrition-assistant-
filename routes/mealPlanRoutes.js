const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createMealPlan,
  listMealPlans,
  getMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getNutrientAnalysis,
} = require('../controllers/mealPlanController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router
  .route('/')
  .post(
    [
      body('client').notEmpty().withMessage('client is required'),
      body('title').trim().notEmpty().withMessage('title is required'),
      body('startDate').isISO8601().withMessage('startDate must be a valid date'),
      body('endDate').isISO8601().withMessage('endDate must be a valid date'),
    ],
    validate,
    createMealPlan
  )
  .get(listMealPlans);

router.route('/:id').get(getMealPlan).put(updateMealPlan).delete(deleteMealPlan);

router.get('/:id/nutrients', getNutrientAnalysis);

module.exports = router;
