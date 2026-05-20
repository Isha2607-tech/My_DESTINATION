import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Partner from './modules/partner/models/Partner.js';
import 'dotenv/config';

const createPartner = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const partnersToCreate = [
      { phone: '8817921168', name: 'Test Partner 1', email: 'testpartner@rukkoo.in' },
      { phone: '6268455485', name: 'Test Partner 2', email: 'testpartner2@rukkoo.in' }
    ];

    for (const p of partnersToCreate) {
      const existingPartner = await Partner.findOne({ phone: p.phone });
      if (existingPartner) {
        console.log(`Partner ${p.phone} already exists.`);
        let modified = false;
        if (existingPartner.isDeleted) {
          existingPartner.isDeleted = false;
          modified = true;
        }
        if (existingPartner.partnerApprovalStatus !== 'approved') {
          existingPartner.partnerApprovalStatus = 'approved';
          modified = true;
        }
        if (existingPartner.isVerified !== true) {
          existingPartner.isVerified = true;
          modified = true;
        }
        if (modified) {
          await existingPartner.save();
          console.log(`Partner ${p.phone} updated/re-activated.`);
        }
      } else {
        const passwordHash = await bcrypt.hash('123456', 10);
        const newPartner = new Partner({
          name: p.name,
          email: p.email,
          phone: p.phone,
          password: passwordHash,
          role: 'partner',
          isPartner: true,
          partnerApprovalStatus: 'approved',
          isVerified: true
        });
        await newPartner.save();
        console.log(`New partner ${p.phone} created successfully`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating partner:', error);
    process.exit(1);
  }
};

createPartner();
