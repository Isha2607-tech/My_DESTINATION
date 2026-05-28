import React, { useState, useEffect } from 'react';
import { api as apiService } from '../../../services/apiService';
import toast from 'react-hot-toast';

const CMSDestinationsConfig = () => {
  const [data, setData] = useState({
    sectionTitle: "Select your perfect trips",
    sectionHeading: "TOP DESTINATION",
    items: [
      { title: "", image: "", description: "", link: "" },
      { title: "", image: "", description: "", link: "" },
      { title: "", image: "", description: "", link: "" },
      { title: "", image: "", description: "", link: "" }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await apiService.get('/cms/landing-page');
      if (res.data?.data?.destinations) {
        // Ensure we always have at least 4 items for the UI
        let items = res.data.data.destinations.items || [];
        while (items.length < 4) {
          items.push({ title: "", image: "", description: "", link: "" });
        }
        setData({ ...res.data.data.destinations, items: items.slice(0, 4) });
      }
    } catch (error) {
      toast.error('Failed to load destinations configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.put('/cms/landing-page', { destinations: data });
      toast.success('Destinations updated successfully!');
    } catch (error) {
      toast.error('Failed to update destinations');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-widest uppercase">Top Destinations</h2>
        <p className="text-sm text-gray-500">Manage the 4 top destinations shown on the homepage.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-sm border border-gray-200 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Section Subtitle</label>
            <input 
              type="text" 
              value={data.sectionTitle}
              onChange={(e) => setData({...data, sectionTitle: e.target.value})}
              className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Section Heading</label>
            <input 
              type="text" 
              value={data.sectionHeading}
              onChange={(e) => setData({...data, sectionHeading: e.target.value})}
              className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-6 mt-6">
          <h3 className="font-bold text-lg border-b pb-2">Destination Cards (4)</h3>
          {data.items.map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-sm border border-gray-200 space-y-4">
              <h4 className="font-bold text-sm text-emerald-700">Card {idx + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Title (e.g. Amsterdam, Netherland)</label>
                  <input 
                    type="text" 
                    value={item.title}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx].title = e.target.value;
                      setData({...data, items: newItems});
                    }}
                    className="w-full border border-gray-200 p-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Image URL (or Path)</label>
                  <input 
                    type="text" 
                    value={item.image}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx].image = e.target.value;
                      setData({...data, items: newItems});
                    }}
                    placeholder="/src/assets/landing/..."
                    className="w-full border border-gray-200 p-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                  <textarea 
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx].description = e.target.value;
                      setData({...data, items: newItems});
                    }}
                    className="w-full border border-gray-200 p-2 text-sm focus:outline-none focus:border-emerald-500"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-emerald-600 text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-emerald-700 transition"
          >
            {saving ? 'Saving...' : 'Save Destinations'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CMSDestinationsConfig;
