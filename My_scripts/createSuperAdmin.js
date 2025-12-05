const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

const Admin = require('../models/Admin');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ams-ai');
    console.log('Connected to MongoDB\n');

    // Get admin details
    console.log('=== Create New Admin ===\n');
    
    const username = await question('Username: ');
    const email = await question('Email: ');
    const fullName = await question('Full Name: ');
    const password = await question('Password: ');
    const roleInput = await question('Role (admin/teacher) [default: admin]: ');
    const role = roleInput.toLowerCase() || 'admin';

    // Validate role
    if (!['admin', 'teacher'].includes(role)) {
      console.log('\n❌ Invalid role. Must be "admin" or "teacher"');
      rl.close();
      process.exit(1);
    }

    // Check if username or email already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email: email.toLowerCase() }]
    });

    if (existingAdmin) {
      console.log('\n❌ Admin with this username or email already exists');
      rl.close();
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      username,
      email: email.toLowerCase(),
      fullName,
      password: hashedPassword,
      role,
      isActive: true
    });

    console.log('\n✅ Admin created successfully!');
    console.log('\nAdmin Details:');
    console.log('─────────────────');
    console.log(`ID: ${admin._id}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Full Name: ${admin.fullName}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Active: ${admin.isActive}`);
    console.log('─────────────────\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
