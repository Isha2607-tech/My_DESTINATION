const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URL = process.env.MONGODB_URL;

const mockAadhar = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&h=250&q=80';
const mockPan = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&h=250&q=80';
const mockPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80';

mongoose.connect(MONGODB_URL)
  .then(async () => {
    console.log('Connected to Cloud MongoDB!');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const result = await User.findOneAndUpdate(
      { email: /bhatiabhishek597/i },
      {
        aadhaarFront: mockAadhar,
        panCardImage: mockPan,
        profileImage: mockPhoto
      },
      { new: true }
    );

    if (result) {
      console.log('✅ Abhishek Bhati KYC details successfully updated with beautiful mock documents!');
      console.log({
        name: result.get('name'),
        aadhaarFront: result.get('aadhaarFront'),
        panCardImage: result.get('panCardImage'),
        profileImage: result.get('profileImage')
      });
    } else {
      console.log('❌ User Abhishek Bhati not found in the database!');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting:', err);
    process.exit(1);
  });
