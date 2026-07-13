const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 1 },
    unit: { type: String, default: 'serving' },
    calories: { type: Number, required: true, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    time: String,
    items: [foodItemSchema],
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    meals: [mealSchema],
    dailyCalorieTarget: Number,
    notes: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Convenience virtual: sums calories across all meals/items
mealPlanSchema.virtual('totalCalories').get(function () {
  return this.meals.reduce((mealSum, meal) => {
    const mealCalories = meal.items.reduce((itemSum, item) => itemSum + (item.calories || 0) * (item.quantity || 1), 0);
    return mealSum + mealCalories;
  }, 0);
});

mealPlanSchema.set('toJSON', { virtuals: true });
mealPlanSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
