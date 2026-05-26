import WeddingPlatformSettings from '../models/WeddingPlatformSettings.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await WeddingPlatformSettings.findOne();
    if (!settings) {
      settings = await WeddingPlatformSettings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  export const updateSettings = async (req, res) => {
    try {
      const { platformFee, vendorCommission, platformFeeType, vendorCommissionType } = req.body;
      
      let settings = await WeddingPlatformSettings.findOne();
      if (!settings) {
        settings = await WeddingPlatformSettings.create({ platformFee, vendorCommission, platformFeeType, vendorCommissionType });
      } else {
        if (platformFee !== undefined) settings.platformFee = platformFee;
        if (vendorCommission !== undefined) settings.vendorCommission = vendorCommission;
        if (platformFeeType !== undefined) settings.platformFeeType = platformFeeType;
        if (vendorCommissionType !== undefined) settings.vendorCommissionType = vendorCommissionType;
        await settings.save();
      }
      
      res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
