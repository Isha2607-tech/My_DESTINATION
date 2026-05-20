import dotenv from 'dotenv';
import mongoose from 'mongoose';
import WeddingDestination from './modules/wedding/models/WeddingDestination.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const dests = await WeddingDestination.find({});
    dests.forEach((d) => {
      console.log(`NAME: ${d.name}, IMAGE: ${d.image ? d.image.substring(0, 100) : 'none'}`);
    });
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
