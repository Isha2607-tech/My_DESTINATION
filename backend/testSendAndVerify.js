import mongoose from 'mongoose';
import Partner from './modules/partner/models/Partner.js';
import 'dotenv/config';

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const phone = '6268455485';

    // 1. Fetch current partner document including otp and otpExpires
    let partner = await Partner.findOne({ phone }).select('+otp +otpExpires');
    console.log('Current Partner State:');
    console.log('OTP:', partner.otp);
    console.log('OTP Expires:', partner.otpExpires);
    console.log('Now:', new Date());

    // 2. Set OTP manually just like sendOtp would do
    console.log('\nSetting OTP to 123456 manually...');
    partner.otp = '123456';
    partner.otpExpires = Date.now() + 10 * 60 * 1000;
    await partner.save();

    // 3. Fetch again to confirm it was persisted
    let partnerAfter = await Partner.findOne({ phone }).select('+otp +otpExpires');
    console.log('Partner State After Save:');
    console.log('OTP:', partnerAfter.otp);
    console.log('OTP Expires:', partnerAfter.otpExpires);

    process.exit(0);
  } catch (error) {
    console.error('Error running test:', error);
    process.exit(1);
  }
};

runTest();
