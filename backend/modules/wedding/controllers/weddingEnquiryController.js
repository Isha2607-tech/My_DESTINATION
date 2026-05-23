import WeddingEnquiry from '../models/WeddingEnquiry.js';
import WeddingVendor from '../models/WeddingVendor.js';
import WeddingVenue from '../models/WeddingVenue.js';
import { createNotification } from '../../notification/controllers/notificationController.js';

/**
 * @desc    Create a new enquiry (User Side)
 */
export const createEnquiry = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      eventDate, 
      weddingDate,
      guestCount, 
      budget, 
      budgetRange,
      message, 
      notes,
      destination,
      selectedServices,
      services,
      targetType, 
      targetId 
    } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Missing required fields (name, email, phone)' });
    }

    const enquiry = await WeddingEnquiry.create({
      name,
      email,
      phone,
      weddingDate: weddingDate || eventDate,
      guestCount,
      budget: budget || budgetRange,
      message: message || notes,
      destination,
      services: services || selectedServices,
      targetType: targetType || 'General',
      targetId: targetId || null,
      user: req.user ? req.user._id : null
    });

    // Create Notification for Vendor
    if (targetId) {
      let vendorUserId = null;
      if (targetType === 'Venue' || targetType === 'venue') {
        const venue = await WeddingVenue.findById(targetId);
        if (venue) vendorUserId = venue.vendor;
      } else {
        const vendor = await WeddingVendor.findById(targetId);
        if (vendor) vendorUserId = vendor.user;
      }

      if (vendorUserId) {
        await createNotification({
          recipient: vendorUserId,
          sender: req.user?._id,
          title: 'New Wedding Enquiry',
          message: `You have received a new enquiry from ${name}.`,
          type: 'enquiry',
          link: '/wedding/vendor/leads'
        });
      }
    }

    res.status(201).json({ success: true, enquiry });
  } catch (error) {
    console.error('Create Enquiry Error:', error);
    res.status(500).json({ message: error.message });
  }
};


export const getMyEnquiries = async (req, res) => {
  try {
    const enquiries = await WeddingEnquiry.find({ 
      $or: [
        { user: req.user._id },
        { email: req.user.email }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    for (let enquiry of enquiries) {
      if (enquiry.targetType === 'Venue' && enquiry.targetId) {
        enquiry.targetId = await WeddingVenue.findById(enquiry.targetId).lean() || enquiry.targetId;
      } else if (enquiry.targetType === 'Vendor' && enquiry.targetId) {
        enquiry.targetId = await WeddingVendor.findById(enquiry.targetId).lean() || enquiry.targetId;
      } else {
        enquiry.targetId = null;
      }
    }

    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get leads for a specific vendor
 */
export const getVendorLeads = async (req, res) => {
  try {
    // 1. Find the vendor profile(s) for this user
    const vendorProfile = await WeddingVendor.findOne({ user: req.user._id });
    const venueProfile = await WeddingVenue.findOne({ vendor: req.user._id });

    const targetIds = [];
    if (vendorProfile) targetIds.push(vendorProfile._id);
    if (venueProfile) targetIds.push(venueProfile._id);

    if (targetIds.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Find enquiries targeting these profiles
    const enquiries = await WeddingEnquiry.find({ 
      targetId: { $in: targetIds } 
    }).sort({ createdAt: -1 });

    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update lead status (Vendor Side)
 */
export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Check if the enquiry belongs to this vendor
    const enquiry = await WeddingEnquiry.findById(id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });

    // Verify ownership (simplified: check if target is owned by user)
    const vendorProfile = await WeddingVendor.findOne({ user: req.user._id });
    const venueProfile = await WeddingVenue.findOne({ vendor: req.user._id });
    
    const isOwner = (vendorProfile && enquiry.targetId.equals(vendorProfile._id)) || 
                    (venueProfile && enquiry.targetId.equals(venueProfile._id));

    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    enquiry.status = status;
    await enquiry.save();
    
    res.status(200).json({ success: true, enquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminEnquiries = async (req, res) => {
  try {
    const { status } = req.query;
    console.log('📍 Fetching Admin Enquiries with status:', status);
    const query = {};
    if (status) query.status = status;

    const enquiries = await WeddingEnquiry.find(query)
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${enquiries.length} enquiries`);
    res.status(200).json(enquiries);
  } catch (error) {
    console.error('❌ Error fetching admin enquiries:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const enquiry = await WeddingEnquiry.findByIdAndUpdate(id, { status }, { new: true });
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    
    res.status(200).json({ success: true, enquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    await WeddingEnquiry.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
