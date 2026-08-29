#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDb = require('../config/db');
const User = require('../models/User');

const usage = `\nCreate or update an admin account:\n  node scripts/upsertAdmin.js <email> <password> [fullName]\n`;

const [, , email, password, fullName = 'Emergency Admin'] = process.argv;

if (!email || !password) {
  console.error('Email and password are required.', usage);
  process.exit(1);
}

const run = async () => {
  await connectDb();

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.fullName = fullName;
      existingUser.password = password; // hashed in pre-save hook
      existingUser.role = 'admin';
      existingUser.status = 'active';
      await existingUser.save();
      console.log(`Updated existing admin account for ${email}`);
    } else {
      await User.create({
        email,
        password,
        fullName,
        phoneNumber: 'N/A',
        role: 'admin',
        status: 'active',
      });
      console.log(`Created new admin account for ${email}`);
    }
  } catch (error) {
    console.error('Failed to upsert admin:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
