import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './modules/user/models/User.js';
import WeddingSubscriptionPlan from './modules/wedding/models/WeddingSubscriptionPlan.js';
import WeddingSubscriptionTransaction from './modules/wedding/models/WeddingSubscriptionTransaction.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const users = await User.find({ hasActiveSubscription: true });
  for (const user of users) {
    if (user.subscriptionPlanId) {
      const plan = await WeddingSubscriptionPlan.findById(user.subscriptionPlanId);
      if (plan) {
        await WeddingSubscriptionTransaction.create({
          vendor: user._id,
          plan: plan._id,
          amount: plan.price,
          paymentId: 'manual_retroactive',
          status: 'Paid',
          validityMonths: plan.validityMonths,
          validityType: plan.validityType || 'months',
          createdAt: user.updatedAt,
        });
      }
    }
  }
  console.log('Migrated old subscriptions');
  process.exit(0);
}).catch(e => console.error(e));
