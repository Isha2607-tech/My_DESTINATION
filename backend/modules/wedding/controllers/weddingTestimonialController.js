import WeddingTestimonial from '../models/WeddingTestimonial.js';
import { uploadBase64ToCloudinary } from '../../../utils/cloudinary.js';

// Public: Submit a testimonial
export const submitTestimonial = async (req, res) => {
  try {
    const { name, location, text, rating, image } = req.body;
    
    let imageUrl = image;
    if (image && image.startsWith('data:image')) {
      try {
        const uploadResponse = await uploadBase64ToCloudinary(image, 'wedding/testimonials');
        imageUrl = uploadResponse.url;
      } catch (uploadError) {
        console.warn('Cloudinary upload failed for testimonial image', uploadError.message);
      }
    }

    const testimonial = await WeddingTestimonial.create({
      name,
      location,
      text,
      rating,
      image: imageUrl,
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Testimonial submitted for review', data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public: Get approved testimonials
export const getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await WeddingTestimonial.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all testimonials
export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await WeddingTestimonial.find().sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Approve/Reject testimonial
export const updateTestimonialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await WeddingTestimonial.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    await WeddingTestimonial.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
