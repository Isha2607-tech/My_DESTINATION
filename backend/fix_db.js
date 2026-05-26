import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WeddingEnquiry from './modules/wedding/models/WeddingEnquiry.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  await WeddingEnquiry.updateMany(
    { status: 'Booked' }, 
    { $set: { actualAmount: 499, commissionAmount: 499, paymentStatus: 'Paid' } }
  );
  console.log('Fixed DB amounts');
  process.exit(0);
}).catch(e => console.error(e));
