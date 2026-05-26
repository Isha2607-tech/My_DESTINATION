import User from '../../user/models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

export const registerVendor = async (req, res) => {
  try {
    const { name, email, phone, password, category } = req.body;

    if (!name || !email || !phone || !password || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { phone }] });
    
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role: 'vendor',
      category,
      partnerApprovalStatus: 'pending',
      isVerified: false
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Vendor registration successful! Pending admin approval.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        category: user.category,
        partnerApprovalStatus: user.partnerApprovalStatus,
        hasActiveSubscription: user.hasActiveSubscription || false,
        leadsRemaining: user.leadsRemaining || 0,
        subscriptionExpiryDate: user.subscriptionExpiryDate || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail, role: 'vendor' });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid vendor credentials' });
    }

    // Check Approval Status
    if (user.partnerApprovalStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: user.partnerApprovalStatus === 'rejected' 
          ? 'Your application has been rejected. Please contact support.' 
          : 'Your account is pending admin approval. You will be able to login once approved.',
        partnerApprovalStatus: user.partnerApprovalStatus
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ message: 'Invalid vendor credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Vendor login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        category: user.category,
        partnerApprovalStatus: user.partnerApprovalStatus,
        hasActiveSubscription: user.hasActiveSubscription || false,
        leadsRemaining: user.leadsRemaining || 0,
        subscriptionExpiryDate: user.subscriptionExpiryDate || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged-in vendor's fresh profile data
// @route   GET /api/wedding/vendor/me
// @access  Private (Vendor)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        category: user.category,
        partnerApprovalStatus: user.partnerApprovalStatus,
        hasActiveSubscription: user.hasActiveSubscription || false,
        leadsRemaining: user.leadsRemaining || 0,
        subscriptionExpiryDate: user.subscriptionExpiryDate || null,
        subscriptionPlanId: user.subscriptionPlanId || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
