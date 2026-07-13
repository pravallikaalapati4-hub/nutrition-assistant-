const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'dietitian', 'admin'],
      default: 'user',
    },
    isApproved: {
      // dietitians require admin approval before they can manage clients
      type: Boolean,
      default: function () {
        return this.role !== 'dietitian';
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profile: {
      age: Number,
      gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
      heightCm: Number,
      weightKg: Number,
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
        default: 'moderate',
      },
      dietaryRestrictions: [String],
      goals: {
        type: String,
        enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain', 'general_health'],
        default: 'general_health',
      },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
