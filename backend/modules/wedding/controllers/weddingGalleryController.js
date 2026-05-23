import WeddingRealWedding from '../models/WeddingRealWedding.js';
import WeddingGallery from '../models/WeddingGallery.js';
import { uploadToCloudinary, uploadBase64ToCloudinary } from '../../../utils/cloudinary.js';

export const getGallery = async (req, res) => {
  try {
    const images = await WeddingGallery.find().sort({ createdAt: -1 });
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addGalleryImage = async (req, res) => {
  try {
    const { image, title, category } = req.body;
    
    let imageUrl = '';
    if (image && image.startsWith('data:image')) {
      const uploadResponse = await uploadBase64ToCloudinary(image, 'wedding/gallery');
      imageUrl = uploadResponse.url;
    }

    const newImage = await WeddingGallery.create({
      url: imageUrl,
      title,
      category
    });

    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    await WeddingGallery.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Real Weddings
export const getRealWeddings = async (req, res) => {
  try {
    const weddings = await WeddingRealWedding.find().populate('destination').sort({ createdAt: -1 });
    res.status(200).json(weddings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addRealWedding = async (req, res) => {
  try {
    const { 
      coupleName, 
      destinationId, 
      locationName, 
      guests, 
      budgetMin, 
      budgetMax, 
      coverImage, 
      photos 
    } = req.body;
    
    let coverImageUrl = '';
    if (coverImage && coverImage.startsWith('data:image')) {
      const uploadResponse = await uploadBase64ToCloudinary(coverImage, 'wedding/real-weddings');
      coverImageUrl = uploadResponse.url;
    } else {
      coverImageUrl = coverImage;
    }

    const uploadedPhotos = [];
    if (photos && Array.isArray(photos)) {
      for (const img of photos) {
        if (img && img.startsWith('data:image')) {
          const uploadRes = await uploadBase64ToCloudinary(img, 'wedding/real-weddings/gallery');
          uploadedPhotos.push(uploadRes.url);
        } else {
          uploadedPhotos.push(img);
        }
      }
    }

    const newWedding = await WeddingRealWedding.create({
      coupleName,
      destination: destinationId || undefined,
      locationName,
      guests: guests ? Number(guests) : undefined,
      budgetMin,
      budgetMax,
      coverImage: coverImageUrl,
      photos: uploadedPhotos
    });

    res.status(201).json(newWedding);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRealWedding = async (req, res) => {
  try {
    const { id } = req.params;
    await WeddingRealWedding.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Real wedding story deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
