const MealPlan = require('../models/MealPlan');
const Client = require('../models/Client');
const { asyncHandler } = require('../middleware/errorHandler');
const { canAccessClient } = require('./clientController');

// @route  POST /api/mealplans
// @access Private (dietitian, admin, or the user themselves for self-managed plans)
exports.createMealPlan = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.body.client);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  if (!canAccessClient(req.user, client)) {
    return res.status(403).json({ success: false, message: 'Not authorized to create a plan for this client' });
  }

  const mealPlan = await MealPlan.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, mealPlan });
});

// @route  GET /api/mealplans?client=<id>
// @access Private
exports.listMealPlans = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.client) filter.client = req.query.client;
  if (req.query.active === 'true') filter.isActive = true;

  const mealPlans = await MealPlan.find(filter)
    .populate('client', 'user dietitian')
    .populate('createdBy', 'name role')
    .sort({ startDate: -1 });

  res.status(200).json({ success: true, count: mealPlans.length, mealPlans });
});

// @route  GET /api/mealplans/:id
// @access Private
exports.getMealPlan = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findById(req.params.id).populate('client').populate('createdBy', 'name role');

  if (!mealPlan) {
    return res.status(404).json({ success: false, message: 'Meal plan not found' });
  }

  if (!canAccessClient(req.user, mealPlan.client)) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this meal plan' });
  }

  res.status(200).json({ success: true, mealPlan });
});

// @route  PUT /api/mealplans/:id
// @access Private (creator, assigned dietitian, admin)
exports.updateMealPlan = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findById(req.params.id).populate('client');
  if (!mealPlan) {
    return res.status(404).json({ success: false, message: 'Meal plan not found' });
  }

  if (!canAccessClient(req.user, mealPlan.client)) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this meal plan' });
  }

  Object.assign(mealPlan, req.body);
  await mealPlan.save();

  res.status(200).json({ success: true, mealPlan });
});

// @route  DELETE /api/mealplans/:id
// @access Private (creator, admin)
exports.deleteMealPlan = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findById(req.params.id).populate('client');
  if (!mealPlan) {
    return res.status(404).json({ success: false, message: 'Meal plan not found' });
  }

  if (!canAccessClient(req.user, mealPlan.client) || req.user.role === 'user') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this meal plan' });
  }

  await mealPlan.deleteOne();
  res.status(200).json({ success: true, message: 'Meal plan deleted' });
});

// @route  GET /api/mealplans/:id/nutrients
// @access Private - returns aggregated nutrient breakdown for a plan
exports.getNutrientAnalysis = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findById(req.params.id).populate('client');
  if (!mealPlan) {
    return res.status(404).json({ success: false, message: 'Meal plan not found' });
  }

  if (!canAccessClient(req.user, mealPlan.client)) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this meal plan' });
  }

  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const byMeal = mealPlan.meals.map((meal) => {
    const mealTotals = meal.items.reduce(
      (acc, item) => {
        const qty = item.quantity || 1;
        acc.calories += (item.calories || 0) * qty;
        acc.protein += (item.protein || 0) * qty;
        acc.carbs += (item.carbs || 0) * qty;
        acc.fat += (item.fat || 0) * qty;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    totals.calories += mealTotals.calories;
    totals.protein += mealTotals.protein;
    totals.carbs += mealTotals.carbs;
    totals.fat += mealTotals.fat;

    return { type: meal.type, ...mealTotals };
  });

  res.status(200).json({
    success: true,
    dailyCalorieTarget: mealPlan.dailyCalorieTarget,
    totals,
    byMeal,
  });
});
