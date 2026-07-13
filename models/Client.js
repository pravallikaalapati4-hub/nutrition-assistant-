const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    user: {
      // the underlying account (role: 'user') this client profile belongs to
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dietitian: {
      // dietitian assigned to manage this client, optional (self-managed users allowed)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    medicalNotes: {
      type: String,
      trim: true,
    },
    allergies: [String],
    targetCalories: {
      type: Number,
      min: 0,
    },
    macroTargets: {
      proteinG: Number,
      carbsG: Number,
      fatG: Number,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
