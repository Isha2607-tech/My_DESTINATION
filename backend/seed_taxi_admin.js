import mongoose from 'mongoose';
import { Admin } from './modules/taxi/admin/models/Admin.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const seedTaxiAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    const email = 'admin@mydestination.com';
    const existingAdmin = await Admin.findOne({ email });
    
    if (existingAdmin) {
      console.log('ℹ️ TaxiAdmin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Admin.create({
      name: 'My Destination Taxi Admin',
      email,
      phone: '9999999999',
      password: hashedPassword,
      role: 'superadmin',
      admin_type: 'superadmin',
      active: true,
      status: 'active'
    });

    console.log('✅ TaxiAdmin seeded successfully!');
    console.log('Credentials: admin@mydestination.com / admin123');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedTaxiAdmin();
