import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminStyles } from '../theme/themeConfig';
import { weddingService } from '../../../../services/weddingService';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  MapPin, 
  Users,
  Camera,
  Heart,
  PlusCircle,
  X,
  Upload,
  Trash,
  Pencil,
  ChevronDown,
  Eye
} from 'lucide-react';

const ManageRealWeddings = () => {
  const [weddings, setWeddings] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingWedding, setEditingWedding] = useState(null);
  const [viewingWedding, setViewingWedding] = useState(null);
  const [newWedding, setNewWedding] = useState({
    coupleName: '',
    locationName: '',
    destinationId: '',
    guests: '',
    budgetMin: '',
    budgetMax: '',
    coverImage: '',
    photos: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [weddingsData, destsData] = await Promise.all([
        weddingService.getRealWeddings(),
        weddingService.getDestinations()
      ]);
      setWeddings(weddingsData);
      setDestinations(destsData);
    } catch (error) {
      console.error('Error fetching real weddings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e, field) => {
    if (field === 'coverImage') {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewWedding(prev => ({ ...prev, coverImage: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      // Handle multiple photos selection concurrently
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      const validFiles = files.filter(file => {
        if (file.size > 2 * 1024 * 1024) {
          alert(`Image "${file.name}" size should be less than 2MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      const promises = validFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then(newImages => {
        setNewWedding(prev => ({
          ...prev,
          photos: [...(prev.photos || []), ...newImages]
        }));
      });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newWedding.coupleName || !newWedding.destinationId || !newWedding.coverImage) {
      alert("Please fill in required fields (Couple Name, Destination, Cover Image)");
      return;
    }

    if (isBudgetInvalid) {
      alert("Min Budget cannot be greater than Max Budget!");
      return;
    }

    try {
      setLoading(true);
      const selectedDest = destinations.find(d => d._id === newWedding.destinationId);
      const weddingData = {
        ...newWedding,
        locationName: selectedDest?.name || newWedding.locationName,
      };
      
      await weddingService.addRealWedding(weddingData);
      setShowAddForm(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Failed to save wedding story');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingWedding(null);
    setNewWedding({
      coupleName: '',
      locationName: '',
      destinationId: '',
      guests: '',
      budgetMin: '',
      budgetMax: '',
      coverImage: '',
      photos: []
    });
  };

  const openAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  // Live validation & character filtering onChange handlers
  const handleCoupleNameChange = (e) => {
    const val = e.target.value;
    // Strictly allow letters, spaces, and '&' only (no numbers or special characters allowed)
    const cleaned = val.replace(/[^a-zA-Z\s&]/g, '');
    setNewWedding(prev => ({ ...prev, coupleName: cleaned }));
  };

  const handleGuestsChange = (e) => {
    const val = e.target.value;
    // Strictly allow digits only (no alphabets, spaces, negative signs or exponent allowed)
    const cleaned = val.replace(/[^0-9]/g, '');
    setNewWedding(prev => ({ ...prev, guests: cleaned }));
  };

  const handleBudgetMinChange = (e) => {
    const val = e.target.value;
    // Strictly allow digits, decimals, 'L', 'Cr', 'K', 'l', 'cr', 'k', spaces, and '₹' symbol
    const cleaned = val.replace(/[^0-9.lcrkLCRK₹\s]/g, '');
    setNewWedding(prev => ({ ...prev, budgetMin: cleaned }));
  };

  const handleBudgetMaxChange = (e) => {
    const val = e.target.value;
    // Strictly allow digits, decimals, 'L', 'Cr', 'K', 'l', 'cr', 'k', spaces, and '₹' symbol
    const cleaned = val.replace(/[^0-9.lcrkLCRK₹\s]/g, '');
    setNewWedding(prev => ({ ...prev, budgetMax: cleaned }));
  };

  // Helper to parse budgets like "35L", "1.5Cr", "50K", "500000" into raw numbers for accurate comparison
  const parseBudgetValue = (val) => {
    if (!val) return 0;
    const cleanStr = val.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr) || 0;
    const lowerVal = val.toLowerCase();
    if (lowerVal.includes('cr')) return num * 10000000;
    if (lowerVal.includes('l')) return num * 100000;
    if (lowerVal.includes('k')) return num * 1000;
    return num;
  };

  const minBudgetNum = parseBudgetValue(newWedding.budgetMin);
  const maxBudgetNum = parseBudgetValue(newWedding.budgetMax);
  const isBudgetInvalid = minBudgetNum > 0 && maxBudgetNum > 0 && minBudgetNum > maxBudgetNum;

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this wedding story?")) return;
    try {
      setLoading(true);
      await weddingService.deleteRealWedding(id);
      fetchData();
    } catch (error) {
      alert('Failed to delete wedding story');
    } finally {
      setLoading(false);
    }
  };

  if (loading && weddings.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(353,45%,35%)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-serif text-[hsl(353,45%,35%)]">Real Weddings Gallery</h2>
            <p className="text-gray-500 text-sm mt-1">Manage the wedding stories and galleries shown to users</p>
          </div>
          <button 
            onClick={openAddForm}
            className="flex items-center gap-2 px-6 py-3 bg-[hsl(353,45%,35%)] text-white rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 leading-none"
          >
             <Plus size={18} /> Add New Wedding
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {weddings.map((wedding) => (
            <div key={wedding._id} className="p-6 rounded-[2rem] group relative overflow-hidden h-[26rem] shadow-xl border border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
              <img 
                src={wedding.coverImage} 
                className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-700" 
                alt={wedding.coupleName}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-start mb-auto">
                    <span className="px-4 py-1.5 bg-[hsl(353,45%,35%)] text-white rounded-full text-[10px] font-black uppercase tracking-widest leading-none shadow-md">
                       {wedding.locationName || wedding.destination?.name}
                    </span>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => handleDelete(wedding._id)}
                         className="p-2.5 bg-red-50/90 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-md backdrop-blur-sm"
                       >
                          <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
                 
                 <div className="mt-auto p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/50 shadow-lg">
                    <h3 className="text-2xl font-black text-[hsl(353,20%,15%)] leading-none mb-2">{wedding.coupleName}</h3>
                    <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                       <Users size={14} className="text-[#B06A6C]"/> {wedding.guests} Guests
                    </div>

                    <div className="mt-4 pt-4 border-t border-[hsl(353,45%,35%)]/10 flex justify-between items-center">
                       <div>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Budget Range</p>
                          <p className="text-sm font-black text-slate-800">{wedding.budgetMin} — {wedding.budgetMax}</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setViewingWedding(wedding)}
                            className="px-3.5 py-2 bg-[hsl(353,45%,35%)] text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-[hsl(353,45%,45%)] active:scale-95 transition-all shadow-md flex items-center gap-1 leading-none"
                          >
                             <Eye size={13} /> View
                          </button>
                          <span className="text-[10px] font-black text-[#B06A6C] uppercase tracking-widest flex items-center gap-1 bg-[#B06A6C]/10 px-3 py-2 rounded-full leading-none">
                             {wedding.photos?.length || 0} Photos
                          </span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
         ))}
         
         {weddings.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#B06A6C]/20 rounded-[2.5rem] bg-white/30 backdrop-blur-sm">
               <PlusCircle size={48} className="text-[#B06A6C]/20 mb-4" />
               <p className="text-gray-400 font-medium">No real weddings added yet.</p>
            </div>
         )}
      </div>

      {/* Add Form Modal Overlay */}
      {showAddForm && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white/90 backdrop-blur-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl p-8 md:p-12 relative border border-white/40 no-scrollbar">
              <button 
                onClick={resetForm}
                className="absolute right-8 top-8 p-3 hover:bg-slate-100 rounded-2xl transition-colors"
              >
                 <X size={24} className="text-slate-400" />
              </button>

              <h3 className="text-3xl font-serif text-[hsl(353,45%,35%)] mb-8">
                {editingWedding ? 'Edit Wedding Story' : 'Add Wedding Story'}
              </h3>
              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Heart size={12} /> Couple Name
                    </label>
                    <input 
                      required
                      type="text"
                      value={newWedding.coupleName}
                      onChange={handleCoupleNameChange}
                      placeholder="e.g. Anita & Rohit"
                      className="w-full px-5 py-3 bg-white border border-[#B06A6C]/20 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B06A6C]/20"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <MapPin size={12} /> Destination
                    </label>
                    <div className="relative">
                       <div 
                         onClick={() => setShowDestDropdown(!showDestDropdown)}
                         className="w-full px-5 py-3 bg-white border border-[#B06A6C]/20 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B06A6C]/20 cursor-pointer flex justify-between items-center"
                       >
                          <span className={newWedding.destinationId ? "text-black" : "text-gray-400"}>
                            {newWedding.destinationId ? destinations.find(d => d._id === newWedding.destinationId)?.name || 'Select Destination' : 'Select Destination'}
                          </span>
                          <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDestDropdown ? 'rotate-180' : ''}`} />
                       </div>
                       
                       {showDestDropdown && (
                         <div className="absolute z-50 w-full mt-2 bg-white border border-[#B06A6C]/20 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                            <div 
                               className="px-5 py-3 hover:bg-[#B06A6C]/5 cursor-pointer text-sm text-gray-500 transition-colors"
                               onClick={() => { setNewWedding({...newWedding, destinationId: ""}); setShowDestDropdown(false); }}
                            >
                                Select Destination
                            </div>
                            {destinations.map(d => (
                               <div 
                                 key={d._id} 
                                 className={`px-5 py-3 cursor-pointer text-sm transition-colors ${newWedding.destinationId === d._id ? 'bg-[#B06A6C]/10 text-[#B06A6C] font-bold' : 'hover:bg-[#B06A6C]/5 text-gray-700'}`}
                                 onClick={() => { setNewWedding({...newWedding, destinationId: d._id}); setShowDestDropdown(false); }}
                               >
                                 {d.name}
                               </div>
                            ))}
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Users size={12} /> No. of Guests
                    </label>
                    <input 
                      type="text"
                      required
                      value={newWedding.guests}
                      onChange={handleGuestsChange}
                      placeholder="e.g. 150"
                      className="w-full px-5 py-3 bg-white border border-[#B06A6C]/20 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B06A6C]/20"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           Min Budget
                        </label>
                        <input
                          required
                          type="text"
                          value={newWedding.budgetMin}
                          onChange={handleBudgetMinChange}
                          placeholder="e.g. ₹35L"
                          className={`w-full px-5 py-3 bg-white border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                            isBudgetInvalid 
                              ? 'border-rose-500 focus:ring-rose-500/20' 
                              : 'border-[#B06A6C]/20 focus:ring-[#B06A6C]/20'
                          }`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           Max Budget
                        </label>
                        <input
                          required
                          type="text"
                          value={newWedding.budgetMax}
                          onChange={handleBudgetMaxChange}
                          placeholder="e.g. ₹50L"
                          className={`w-full px-5 py-3 bg-white border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                            isBudgetInvalid 
                              ? 'border-rose-500 focus:ring-rose-500/20' 
                              : 'border-[#B06A6C]/20 focus:ring-[#B06A6C]/20'
                          }`}
                        />
                    </div>
                    {isBudgetInvalid && (
                      <div className="col-span-2 text-rose-500 text-xs font-bold flex items-center gap-1.5 px-1 animate-in fade-in duration-200 mt-1">
                        <span>⚠️ Max budget cannot be less than Min budget!</span>
                      </div>
                    )}
                 </div>

                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <ImageIcon size={12} /> Cover Image
                    </label>
                    <div className="relative group">
                       <input 
                         type="file" 
                         id="wedding-cover-upload"
                         accept="image/*"
                         onChange={e => handleImageChange(e, 'coverImage')}
                         className="hidden" 
                       />
                       
                       {!newWedding.coverImage ? (
                         <label 
                           htmlFor="wedding-cover-upload"
                           className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#B06A6C]/20 rounded-3xl bg-white/50 hover:bg-[#B06A6C]/5 hover:border-[#B06A6C]/40 transition-all cursor-pointer"
                         >
                            <div className="flex flex-col items-center gap-2">
                               <Upload size={20} className="text-[#B06A6C]" />
                               <p className="text-sm font-bold text-slate-600">Click to upload cover photo</p>
                            </div>
                         </label>
                       ) : (
                         <div className="relative h-48 w-full rounded-3xl overflow-hidden border border-[#B06A6C]/20">
                            <img src={newWedding.coverImage} className="w-full h-full object-cover" alt="Cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                               <label htmlFor="wedding-cover-upload" className="p-3 bg-white text-[hsl(353,45%,35%)] rounded-2xl cursor-pointer">
                                  <Upload size={20} />
                                </label>
                               <button type="button" onClick={() => setNewWedding({ ...newWedding, coverImage: '' })} className="p-3 bg-white text-red-500 rounded-2xl">
                                  <Trash size={20} />
                               </button>
                            </div>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Camera size={12} /> Gallery Photos ({newWedding.photos?.length || 0})
                    </label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                       {newWedding.photos?.map((img, idx) => (
                         <div key={idx} className="aspect-square relative rounded-xl overflow-hidden group/img">
                            <img src={img} className="w-full h-full object-cover" alt="" />
                            <button 
                              type="button" 
                              onClick={() => setNewWedding({ ...newWedding, photos: newWedding.photos.filter((_, i) => i !== idx) })}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                            >
                               <Trash2 size={16} className="text-white" />
                            </button>
                         </div>
                       ))}
                       <label className="aspect-square border-2 border-dashed border-[#B06A6C]/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#B06A6C]/5 transition-all">
                          <Plus size={20} className="text-[#B06A6C]" />
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={e => handleImageChange(e, 'photos')} 
                          />
                       </label>
                    </div>
                 </div>

                 <div className="md:col-span-2 pt-4">
                    <button
                      type="submit"
                      disabled={loading || isBudgetInvalid}
                      className="w-full py-4 bg-[hsl(353,45%,35%)] text-white rounded-[2rem] font-bold shadow-xl shadow-[hsl(353,45%,35%)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                       {loading ? 'Processing...' : (editingWedding ? 'Update Wedding Story' : 'Save Wedding Story')}
                    </button>
                 </div>
              </form>
           </div>
        </div>,
        document.body
      )}

      {/* Lightbox / View Modal Overlay */}
      {viewingWedding && createPortal(
         <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl p-8 md:p-12 relative border border-white/20 no-scrollbar">
               <button 
                 onClick={() => setViewingWedding(null)}
                 className="absolute right-8 top-8 p-3 hover:bg-slate-100 rounded-2xl transition-colors z-50 bg-white/80 backdrop-blur-sm shadow-md"
               >
                  <X size={24} className="text-slate-600" />
               </button>

               <div className="relative h-80 w-full rounded-[2rem] overflow-hidden mb-8 shadow-lg">
                  <img src={viewingWedding.coverImage} className="w-full h-full object-cover" alt="Cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 text-white">
                     <span className="px-4 py-1.5 bg-[#B06A6C] text-white rounded-full text-[10px] font-black uppercase tracking-widest leading-none mb-3 inline-block">
                        {viewingWedding.locationName || viewingWedding.destination?.name}
                     </span>
                     <h3 className="text-4xl font-serif font-bold">{viewingWedding.coupleName}</h3>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                     <Users className="text-[#B06A6C]" size={20} />
                     <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">GUEST COUNT</p>
                        <p className="text-base font-bold text-slate-800">{viewingWedding.guests} Guests</p>
                     </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 col-span-2">
                     <div className="flex flex-col">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">BUDGET RANGE</p>
                        <p className="text-base font-bold text-slate-800">{viewingWedding.budgetMin} — {viewingWedding.budgetMax}</p>
                     </div>
                  </div>
               </div>

               <h4 className="text-xl font-serif text-[hsl(353,45%,35%)] mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <ImageIcon size={20} /> Gallery Photos ({viewingWedding.photos?.length || 0})
               </h4>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {viewingWedding.photos?.map((img, idx) => (
                    <div key={idx} className="aspect-square relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-zoom-in border border-slate-100">
                       <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt={`Gallery ${idx + 1}`} onClick={() => window.open(img, '_blank')} />
                    </div>
                  ))}
                  {(!viewingWedding.photos || viewingWedding.photos.length === 0) && (
                     <p className="text-gray-400 text-sm col-span-full py-8 text-center italic">No gallery photos added yet.</p>
                  )}
               </div>
            </div>
         </div>,
         document.body
      )}
    </div>
  );
};

export default ManageRealWeddings;
