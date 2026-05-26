import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema({
  platformFee: { 
    type: Number, 
    default: 499,
    description: "Fee paid by the user to confirm the booking"
  },
  vendorCommission: { 
    type: Number, 
    default: 499,
    description: "Amount deducted from vendor's wallet upon successful booking"
  },
  platformFeeType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },
  vendorCommissionType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },
  currency: {
    type: String,
    default: 'INR'
  }
}, { timestamps: true });

export default mongoose.model('WeddingPlatformSettings', platformSettingsSchema);
