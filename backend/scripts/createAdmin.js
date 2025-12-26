/**
 * ===========================================
 * CREATE ADMIN USER (One-time CLI)
 * ===========================================
 * Usage:
 *   cd backend
 *   node scripts/createAdmin.js
 *
 * Reads from env:
 *   ADMIN_PHONE (required)
 *   ADMIN_NAME (optional)
 *   ADMIN_EMAIL (optional)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  const phone = String(process.env.ADMIN_PHONE || '').trim();
  const fullName = String(process.env.ADMIN_NAME || 'Admin').trim();
  const email = String(process.env.ADMIN_EMAIL || '').trim() || undefined;

  if (!phone || phone.length !== 10) {
    console.error('❌ Please set ADMIN_PHONE (10 digits) in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const update = {
    phone,
    fullName,
    role: 'admin',
    isPhoneVerified: true,
    status: 'active'
  };
  if (email) update.email = email;

  const user = await User.findOneAndUpdate(
    { phone },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  console.log('✅ Admin user ready:');
  console.log({ id: String(user._id), phone: user.phone, fullName: user.fullName, role: user.role, email: user.email || null });
  console.log('\nNext: Login on frontend using OTP with ADMIN_PHONE.');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ Failed:', e);
  process.exit(1);
});