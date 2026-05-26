import VendorWallet from '../models/VendorWallet.js';

// @desc    Get Vendor Wallet details
// @route   GET /api/wedding/vendor/wallet
// @access  Private (Vendor)
export const getWallet = async (req, res) => {
  try {
    let wallet = await VendorWallet.findOne({ vendorUser: req.user._id });
    
    // Auto-create wallet if it doesn't exist
    if (!wallet) {
      wallet = await VendorWallet.create({
        vendorUser: req.user._id,
        balance: 0,
        transactions: []
      });
    }

    // Sort transactions by date descending
    wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add money to Vendor Wallet
// @route   POST /api/wedding/vendor/wallet/add
// @access  Private (Vendor)
export const addMoney = async (req, res) => {
  try {
    const { amount, paymentId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // In a real app, verify paymentId with gateway here

    let wallet = await VendorWallet.findOne({ vendorUser: req.user._id });
    
    if (!wallet) {
      wallet = await VendorWallet.create({ vendorUser: req.user._id, balance: 0, transactions: [] });
    }

    wallet.balance += Number(amount);
    wallet.transactions.push({
      type: 'credit',
      amount: Number(amount),
      description: 'Wallet Recharge',
      date: new Date()
    });

    await wallet.save();

    res.status(200).json({ success: true, message: 'Money added successfully', data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
