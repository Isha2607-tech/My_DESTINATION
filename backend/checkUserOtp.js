import mongoose from 'mongoose';
import User from './modules/user/models/User.js';
import 'dotenv/config';

const checkUserOtp = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const phone = '6268455485';
    const user = await User.findOne({ phone }).select('+otp +otpExpires');
    if (user) {
      console.log('User OTP Status:');
      console.log('OTP:', user.otp);
      console.log('OTP Expires:', user.otpExpires);
      console.log('Now:', new Date());
    } else {
      console.log('User not found.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUserOtp();
