const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URL = process.env.MONGODB_URL;

mongoose.connect(MONGODB_URL)
  .then(async () => {
    console.log('Connected to Cloud MongoDB!');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const bhati = await User.findOne({ email: /bhatiabhishek597/i });
    if (bhati) {
      console.log('User Record Found:');
      console.log(JSON.stringify({
        name: bhati.get('name'),
        email: bhati.get('email'),
        role: bhati.get('role'),
        partnerApprovalStatus: bhati.get('partnerApprovalStatus'),
        aadhaarFront: bhati.get('aadhaarFront') ? bhati.get('aadhaarFront').substring(0, 100) + '...' : null,
        panCardImage: bhati.get('panCardImage') ? bhati.get('panCardImage').substring(0, 100) + '...' : null,
        profileImage: bhati.get('profileImage') ? bhati.get('profileImage').substring(0, 100) + '...' : null,
      }, null, 2));
    } else {
      console.log('User not found!');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting:', err);
    process.exit(1);
  });
