import mongoose from 'mongoose';

const weddingSubscriptionPlanSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    validityMonths: {
      type: Number,
      required: true,
      min: 1
    },
    validityType: {
      type: String,
      enum: ['days', 'months'],
      default: 'months'
    },
    numberOfLeads: {
      type: Number,
      required: true,
      min: 1
    },
    features: [{
      type: String,
      trim: true
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('WeddingSubscriptionPlan', weddingSubscriptionPlanSchema);
