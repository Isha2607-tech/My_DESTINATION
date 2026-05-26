import React, { useState, useEffect } from 'react';
import { Settings, Save, Loader2, IndianRupee } from 'lucide-react';
import { platformSettingsService } from '../../../../services/apiService';
import toast from 'react-hot-toast';

const AdminFinancialSettings = () => {
  const [settings, setSettings] = useState({
    platformFee: 499,
    platformFeeType: 'fixed',
    vendorCommission: 499,
    vendorCommissionType: 'fixed',
    currency: 'INR'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await platformSettingsService.getSettings();
      if (data) {
        setSettings({
          platformFee: data.platformFee || 499,
          platformFeeType: data.platformFeeType || 'fixed',
          vendorCommission: data.vendorCommission || 499,
          vendorCommissionType: data.vendorCommissionType || 'fixed',
          currency: data.currency || 'INR'
        });
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;

    if (value.length > 6) {
      toast.error('Value cannot exceed 6 digits', { id: `err_${name}` });
      return;
    }

    setSettings(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const toastId = toast.loading("Saving settings...");
      await platformSettingsService.updateSettings({
        platformFee: settings.platformFee,
        platformFeeType: settings.platformFeeType,
        vendorCommission: settings.vendorCommission,
        vendorCommissionType: settings.vendorCommissionType
      });
      toast.success("Settings saved successfully!", { id: toastId });
    } catch (error) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Global Financial Settings</h2>
            <p className="text-sm text-slate-500">Manage platform fees and vendor commission deductions globally.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* User Side Setting */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">User Side: Booking Confirmation</h3>
            <p className="text-sm text-slate-500 mb-4">
              This is the "Platform Fee" amount that a User sees and pays during the "Complete Booking" step on their Enquiries dashboard.
            </p>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Platform Fee Amount</label>
              <div className="flex items-center gap-4 max-w-lg">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {settings.platformFeeType === 'percentage' ? <span className="text-slate-400 font-bold ml-1">%</span> : <IndianRupee className="w-5 h-5 text-slate-400" />}
                  </div>
                  <input
                    type="number"
                    name="platformFee"
                    value={settings.platformFee}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="e.g. 499"
                  />
                </div>
                <select
                  name="platformFeeType"
                  value={settings.platformFeeType}
                  onChange={(e) => setSettings(prev => ({ ...prev, platformFeeType: e.target.value }))}
                  className="w-48 px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium text-slate-700"
                >
                  <option value="fixed">Fixed (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vendor Side Setting */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Vendor Side: Automatic Commission Deduction</h3>
            <p className="text-sm text-slate-500 mb-4">
              This is the exact amount automatically deducted (debited) from the Vendor's Wallet when a user confirms a booking.
            </p>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Vendor Commission Amount</label>
              <div className="flex items-center gap-4 max-w-lg">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {settings.vendorCommissionType === 'percentage' ? <span className="text-slate-400 font-bold ml-1">%</span> : <IndianRupee className="w-5 h-5 text-slate-400" />}
                  </div>
                  <input
                    type="number"
                    name="vendorCommission"
                    value={settings.vendorCommission}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="e.g. 499"
                  />
                </div>
                <select
                  name="vendorCommissionType"
                  value={settings.vendorCommissionType}
                  onChange={(e) => setSettings(prev => ({ ...prev, vendorCommissionType: e.target.value }))}
                  className="w-48 px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium text-slate-700"
                >
                  <option value="fixed">Fixed (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancialSettings;
