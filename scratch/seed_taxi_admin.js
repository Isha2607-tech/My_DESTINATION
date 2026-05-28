import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Admin } from '../backend/modules/taxi/admin/models/Admin.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const seedTaxiAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URL);
    console.log('📦 Connected to MongoDB (Taxi module)...');

    const email = 'admin@mydestination.com';
    const password = 'admin123'; // Using raw string since Taxi backend hashes or compares raw based on pattern

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('✅ Taxi Admin already exists!');
      existingAdmin.password = password; // Taxi handles both hashed and raw, let's keep it simple or hash it.
      // Taxi comparePassword uses bcrypt
      const salt = await bcrypt.genSalt(10);
      existingAdmin.password = await bcrypt.hash(password, salt);
      await existingAdmin.save();
      console.log('✅ Taxi Admin password updated/synced!');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await Admin.create({
        name: 'Super Admin',
        email: email,
        password: hashedPassword,
        role: 'superadmin',
        admin_type: 'superadmin',
        active: true,
        status: 'active'
      });
      console.log('✅ Taxi Admin seeded successfully!');
    }

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedTaxiAdmin();
