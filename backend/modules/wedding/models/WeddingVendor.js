import mongoose from 'mongoose';

const weddingVendorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true 
  },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'WeddingDestination' },
  location: { type: String },
  experience: { type: Number },
  price: { 
    base: { type: Number },
    baseFeatures: { type: String },
    premium: { type: Number },
    premiumFeatures: { type: String },
    type: { type: String, default: 'per_day' }
  },
  portfolio: [{ type: String }], // Main portfolio images
  albums: [{
    name: { type: String },
    location: { type: String },
    description: { type: String },
    cover: { type: String },
    images: [{ type: String }],
    count: { type: Number }
  }],
  videos: [{ type: String }],
  projects: [{
    name: { type: String },
    location: { type: String },
    portfolio: [{ type: String }],
    albums: [{
      name: { type: String },
      cover: { type: String },
      images: [{ type: String }],
      count: { type: Number }
    }],
    videos: [{ type: String }],
    price: {
      base: { type: Number },
      type: { type: String }
    }
  }],
  contactPhone: { type: String },
  contactEmail: { type: String },
  avatar: { type: String },
  notificationSettings: {
    leads: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true }
  },
  rating: { type: Number, default: 0 },
  about: { type: String },
  views: { type: Number, default: 0 },
  shortlistCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  services: [{
    name: { type: String },
    description: { type: String },
    price: { type: Number }
  }],
  status: { type: String, enum: ['draft', 'pending', 'active', 'inactive'], default: 'draft' }
}, { timestamps: true });

export default mongoose.model('WeddingVendor', weddingVendorSchema);
