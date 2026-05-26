import mongoose from 'mongoose';

const weddingSubscriptionTransactionSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'WeddingSubscriptionPlan', required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String },
  status: { type: String, enum: ['Paid', 'Failed', 'Pending'], default: 'Paid' },
  validityMonths: { type: Number },
  validityType: { type: String }
}, { timestamps: true });

export default mongoose.model('WeddingSubscriptionTransaction', weddingSubscriptionTransactionSchema);
