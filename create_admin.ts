import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './src/models/Admin.js';

dotenv.config();

async function createInitialAdmin() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
  }

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be defined');
    process.exit(1);
  }

  if (adminPassword.length < 12) {
    console.error('ADMIN_PASSWORD must be at least 12 characters');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin already exists');
    } else {
      const newAdmin = new Admin({
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      await newAdmin.save();
      console.log('Initial admin created successfully.');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating initial admin:', error);
    process.exit(1);
  }
}

createInitialAdmin();
