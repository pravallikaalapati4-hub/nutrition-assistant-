// Populates the database with a sample admin, dietitian, user, client, meal plan, and progress entry.
// Run with: npm run seed
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Client = require('../models/Client');
const MealPlan = require('../models/MealPlan');
const Progress = require('../models/Progress');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([User.deleteMany(), Client.deleteMany(), MealPlan.deleteMany(), Progress.deleteMany()]);

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Admin Account',
    email: 'admin@nutritionassistant.com',
    password: 'Admin@123',
    role: 'admin',
  });

  const dietitian = await User.create({
    name: 'Dr. Ayesha Rao',
    email: 'dietitian@nutritionassistant.com',
    password: 'Dietitian@123',
    role: 'dietitian',
    isApproved: true,
  });

  const client = await User.create({
    name: 'Sam Carter',
    email: 'user@nutritionassistant.com',
    password: 'User@123',
    role: 'user',
    profile: {
      age: 29,
      gender: 'other',
      heightCm: 172,
      weightKg: 74,
      activityLevel: 'moderate',
      goals: 'weight_loss',
    },
  });

  console.log('Creating client profile...');
  const clientProfile = await Client.create({
    user: client._id,
    dietitian: dietitian._id,
    targetCalories: 1900,
    macroTargets: { proteinG: 140, carbsG: 190, fatG: 60 },
  });

  console.log('Creating a sample meal plan...');
  await MealPlan.create({
    client: clientProfile._id,
    createdBy: dietitian._id,
    title: 'Week 1 - Weight Loss Kickoff',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    dailyCalorieTarget: 1900,
    meals: [
      {
        type: 'breakfast',
        time: '08:00',
        items: [{ name: 'Oatmeal with berries', quantity: 1, unit: 'bowl', calories: 320, protein: 10, carbs: 55, fat: 6 }],
      },
      {
        type: 'lunch',
        time: '13:00',
        items: [{ name: 'Grilled chicken salad', quantity: 1, unit: 'plate', calories: 450, protein: 40, carbs: 20, fat: 18 }],
      },
    ],
  });

  console.log('Creating a sample progress entry...');
  await Progress.create({
    client: clientProfile._id,
    date: new Date(),
    weightKg: 73.6,
    caloriesConsumed: 1850,
    macrosConsumed: { proteinG: 130, carbsG: 180, fatG: 58 },
    adherencePercent: 92,
    mood: 'good',
  });

  console.log('Seed complete. Sample logins:');
  console.log('  admin@nutritionassistant.com / Admin@123');
  console.log('  dietitian@nutritionassistant.com / Dietitian@123');
  console.log('  user@nutritionassistant.com / User@123');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
