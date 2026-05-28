import React, { useState, useEffect } from 'react';
import { api as apiService } from '../../../services/apiService';
import toast from 'react-hot-toast';

const CMSHeroConfig = () => {
  const [heroData, setHeroData] = useState({
    titleLines: ["Experience", "Unforgettable", "travel", "Experiences"],
    subText: "Find amazing things to do. Anytime, anywhere.",
    buttonText: "Explore Our Tours",
    buttonLink: "/welcome"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await apiService.get('/cms/landing-page');
      if (res.data?.data?.hero) {
        setHeroData(res.data.data.hero);
      }
    } catch (error) {
      toast.error('Failed to load hero configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.put('/cms/landing-page', { hero: heroData });
      toast.success('Hero section updated successfully!');
    } catch (error) {
      toast.error('Failed to update hero section');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-widest uppercase">Hero Section</h2>
        <p className="text-sm text-gray-500">Edit the main text and buttons that appear at the top of the homepage.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-sm border border-gray-200 shadow-sm space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-lg border-b pb-2">Main Titles</h3>
          {heroData.titleLines.map((line, idx) => (
            <div key={idx} className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Line {idx + 1}</label>
              <input 
                type="text" 
                value={line}
                onChange={(e) => {
                  const newLines = [...heroData.titleLines];
                  newLines[idx] = e.target.value;
                  setHeroData({...heroData, titleLines: newLines});
                }}
                className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg border-b pb-2">Sub Text & Button</h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sub Text</label>
            <textarea 
              value={heroData.subText}
              onChange={(e) => setHeroData({...heroData, subText: e.target.value})}
              className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-emerald-500 transition"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Button Text</label>
              <input 
                type="text" 
                value={heroData.buttonText}
                onChange={(e) => setHeroData({...heroData, buttonText: e.target.value})}
                className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Button Link</label>
              <input 
                type="text" 
                value={heroData.buttonLink}
                onChange={(e) => setHeroData({...heroData, buttonLink: e.target.value})}
                className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-emerald-600 text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-emerald-700 transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CMSHeroConfig;
