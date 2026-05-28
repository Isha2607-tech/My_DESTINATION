import mongoose from 'mongoose';
import Admin from './modules/admin/models/Admin.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const checkAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const admins = await Admin.find({});
    console.log('Admins in DB:', admins.map(a => ({ email: a.email, isActive: a.isActive })));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};
checkAdmins();
