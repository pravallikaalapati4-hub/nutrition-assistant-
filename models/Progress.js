const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    mealPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealPlan',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    weightKg: Number,
    caloriesConsumed: Number,
    macrosConsumed: {
      proteinG: Number,
      carbsG: Number,
      fatG: Number,
    },
    adherencePercent: {
      // how closely the day matched the plan, 0-100
      type: Number,
      min: 0,
      max: 100,
    },
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'low', 'poor'],
    },
    notes: String,
  },
  { timestamps: true }
);

progressSchema.index({ client: 1, date: -1 });

module.exports = mongoose.model('Progress', progressSchema);
