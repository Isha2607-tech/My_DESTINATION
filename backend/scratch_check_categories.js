import dotenv from 'dotenv';
import mongoose from 'mongoose';
import WeddingCategory from './modules/wedding/models/WeddingCategory.js';

dotenv.config();

async function run() {
  try {
    console.log("Connecting to:", process.env.MONGODB_URL);
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected!");
    
    const categories = await WeddingCategory.find({});
    console.log("TOTAL CATEGORIES:", categories.length);
    console.log("CATEGORIES DATA:");
    console.log(JSON.stringify(categories, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected!");
  }
}

run();
