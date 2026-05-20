import mongoose from 'mongoose';
import Partner from './modules/partner/models/Partner.js';
import User from './modules/user/models/User.js';
import 'dotenv/config';

const checkPartner = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const phone = '6268455485';

    console.log('--- Checking Partner Collection ---');
    const partner = await Partner.findOne({ phone });
    if (partner) {
      console.log('Partner Found:');
      console.log(JSON.stringify(partner, null, 2));
    } else {
      console.log('Partner NOT found in Partner collection.');
    }

    console.log('\n--- Checking User Collection ---');
    const user = await User.findOne({ phone });
    if (user) {
      console.log('User Found:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('User NOT found in User collection.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

checkPartner();
