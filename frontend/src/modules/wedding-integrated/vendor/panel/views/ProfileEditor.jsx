import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { 
  Save, 
  MapPin, 
  Star, 
  CheckCircle, 
  Info, 
  Tag, 
  Phone,
  Mail,
  Camera,
  RotateCcw,
  Image as ImageIcon,
  Plus,
  Trash2,
  Play,
  FileText,
  DollarSign,
  Layers,
  Layout,
  ExternalLink,
  PlusCircle,
  Video,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Check,
  ChevronDown
} from "lucide-react";
import VendorLayout from "../layouts/VendorLayout";
import { useAuth } from "../../context/AuthContext";
import { weddingService } from "../../../../../services/weddingService";


const ProfileEditor = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "Profile");
  const [activeWorkTab, setActiveWorkTab] = useState("Portfolio");
  const [showToast, setShowToast] = useState(false);
  const [viewingGallery, setViewingGallery] = useState(false);
  const bannerInputRef = useRef(null);
  const portfolioInputRef = useRef(null);
  const albumInputRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [destinations, setDestinations] = useState([]);
  
  // New states for Album Form
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [albumForm, setAlbumForm] = useState({ name: "", location: "", description: "" });
  
  // Update tab if location state changes
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
    if (location.state?.workTab) {
      setActiveWorkTab(location.state.workTab);
    }
  }, [location.state]);

  const [vendorData, setVendorData] = useState(() => {
    const defaultData = {
      id: Date.now(),
      name: "",
      about: "",
      location: "",
      category: "Photographers",
      rating: 4.8,
      reviews: 0,
      services: [],
      phone: "",
      email: "",
      banner: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
      basePackage: { price: "", unit: "per day", features: "" },
      premiumPackage: { price: "", unit: "per day", features: "" },
      portfolio: [],
      albums: [],
      videos: [],
      isFeatured: true
    };

    const targetId = location.state?.id;
    if (targetId) {
      const allProjects = JSON.parse(localStorage.getItem('vendorProjects') || '[]');
      const found = allProjects.find(p => p.id === targetId);
      if (found) return { ...defaultData, ...found };
    }

    const onboarding = localStorage.getItem('vendor_onboarding_draft');
    if (onboarding) {
       try {
         const oData = JSON.parse(onboarding);
         if (oData.basicInfo && oData.basicInfo.name) {
           return {
             ...defaultData,
             name: oData.basicInfo.name || defaultData.name,
             location: oData.basicInfo.location || defaultData.location,
             category: oData.basicInfo.category || defaultData.category,
             phone: oData.basicInfo.phone || defaultData.phone,
             email: oData.basicInfo.email || defaultData.email,
             services: oData.services || defaultData.services,
             portfolio: oData.portfolio || defaultData.portfolio,
             basePackage: {
               ...defaultData.basePackage,
               price: oData.pricing?.basePrice ? `₹${oData.pricing.basePrice}` : defaultData.basePackage.price
             },
             premiumPackage: {
               ...defaultData.premiumPackage,
               price: oData.pricing?.premiumPrice ? `₹${oData.pricing.premiumPrice}` : defaultData.premiumPackage.price,
               features: oData.pricing?.description || defaultData.premiumPackage.features
             }
           };
         }
       } catch (e) {}
    }

    return defaultData;
  });

  // Fetch initial data (destinations + profile)
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch destinations
        const dests = await weddingService.getDestinations();
        if (Array.isArray(dests)) setDestinations(dests);

        // Fetch Profile
        const { getVendor } = await import('../../data/vendorApi.js');
        const res = await getVendor();
        if (res.success && res.vendor) {
          const v = res.vendor;
          setVendorData(prev => ({
            ...prev,
            name: v.name || prev.name,
            location: v.location || prev.location,
            category: v.category || prev.category,
            phone: v.contactPhone || prev.phone,
            email: v.contactEmail || prev.email,
            about: v.about || prev.about,
            services: v.services || prev.services,
            portfolio: v.portfolio || prev.portfolio,
            basePackage: {
              ...prev.basePackage,
              price: v.price?.base ? `₹${v.price.base}` : prev.basePackage.price,
              features: v.price?.baseFeatures || prev.basePackage.features
            },
            premiumPackage: {
              ...prev.premiumPackage,
              price: v.price?.premium ? `₹${v.price.premium}` : prev.premiumPackage.price,
              features: v.price?.premiumFeatures || prev.premiumPackage.features
            },
            albums: v.albums || prev.albums,
            videos: v.videos || prev.videos
          }));
        }
      } catch (error) {
        console.error("Initialization failed", error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('vendorProfileUpdate', { detail: vendorData }));
  }, [vendorData]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail && JSON.stringify(e.detail) !== JSON.stringify(vendorData)) {
        setVendorData(prev => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('vendorProfileUpdate', handleUpdate);
    return () => window.removeEventListener('vendorProfileUpdate', handleUpdate);
  }, [vendorData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVendorData(prev => ({ ...prev, [name]: value }));
  };

  const handlePackageChange = (pkg, field, value) => {
    setVendorData(prev => ({
      ...prev,
      [pkg]: { ...prev[pkg], [field]: value }
    }));
  };

  const handleFileUpload = (e, target) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (target === 'portfolio') {
      const loaders = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(loaders).then(newImages => {
        setVendorData(prev => ({ 
          ...prev, 
          portfolio: [...newImages, ...prev.portfolio].slice(0, 20) 
        }));
      });
    } else {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'banner') {
          setVendorData(prev => ({ ...prev, banner: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ""; // Reset input so same files can be selected again
  };

  const handleSave = async () => {
    try {
      const dataToSave = { ...vendorData, ownerId: user?.id };
      
      // Update local storage (wrap in try-catch to prevent quota limit from blocking the server save)
      try {
        const allProjects = JSON.parse(localStorage.getItem('vendorProjects') || '[]');
        const projectIndex = allProjects.findIndex(p => p.id === vendorData.id);
        
        let updatedProjects;
        if (projectIndex > -1) {
          updatedProjects = allProjects.map(p => p.id === vendorData.id ? dataToSave : p);
        } else {
          updatedProjects = [...allProjects, dataToSave];
        }
        localStorage.setItem('vendorProjects', JSON.stringify(updatedProjects));
      } catch (storageError) {
        console.warn("Could not save to local storage (likely quota exceeded). Continuing to server save...", storageError);
      }
      
      window.dispatchEvent(new CustomEvent('vendorProfileUpdate', { detail: dataToSave }));
      
      // Save to backend API
      const { createVendor } = await import('../../data/vendorApi.js');
      const apiPayload = {
        name: vendorData.name,
        category: vendorData.category,
        location: vendorData.location,
        about: vendorData.about,
        contactPhone: vendorData.phone,
        contactEmail: vendorData.email,
        price: {
            base: parseInt((vendorData.basePackage?.price || '0').toString().replace(/\D/g, '')) || 0,
            baseFeatures: vendorData.basePackage?.features || '',
            premium: parseInt((vendorData.premiumPackage?.price || '0').toString().replace(/\D/g, '')) || 0,
            premiumFeatures: vendorData.premiumPackage?.features || '',
            type: 'total'
        },
        services: vendorData.services,
        portfolio: vendorData.portfolio,
        albums: vendorData.albums,
        videos: vendorData.videos
      };
      
      await createVendor(apiPayload);
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      alert("Storage limit reached or failed to save to server.");
    }
  };

  const handleAddVideo = () => {
    if (videoUrl.trim()) {
      setVendorData(prev => ({
        ...prev,
        videos: [...(prev.videos || []), videoUrl.trim()]
      }));
      setVideoUrl("");
    }
  };

  const handleRemoveVideo = (index) => {
    setVendorData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const handleAddAlbum = () => {
    setShowAlbumForm(true);
  };

  const triggerAlbumUpload = (e) => {
    if (e) e.preventDefault();
    if (!albumForm.name || !albumForm.location) {
      alert("Please enter Album Name and Location first.");
      return;
    }
    albumInputRef.current?.click();
  };

  const handleAlbumUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (files.length > 10) { alert("Max 10 photos per album."); return; }
    
    const loaders = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(loaders).then(newImages => {
      setVendorData(prev => {
        const updatedAlbums = [...(prev.albums || [])];
        if (viewingGallery !== false && updatedAlbums[viewingGallery]) {
          const album = updatedAlbums[viewingGallery];
          updatedAlbums[viewingGallery] = {
            ...album,
            images: [...album.images, ...newImages],
            count: album.images.length + newImages.length,
            cover: album.cover || newImages[0]
          };
          return { ...prev, albums: updatedAlbums };
        } else {
          const newAlbum = {
            id: Date.now(),
            name: albumForm.name,
            location: albumForm.location,
            description: albumForm.description,
            images: newImages,
            count: newImages.length,
            cover: newImages[0]
          };
          return { ...prev, albums: [newAlbum, ...(prev.albums || [])] };
        }
      });
      setShowAlbumForm(false);
      setAlbumForm({ name: "", location: "", description: "" });
    });
    e.target.value = "";
  };

  const handleRemoveAlbum = (index) => {
    setVendorData(prev => ({
      ...prev,
      albums: prev.albums.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveGalleryImage = (albumIdx, imgIdx) => {
    setVendorData(prev => {
      const updatedAlbums = [...(prev.albums || [])];
      if (updatedAlbums[albumIdx]) {
        const updatedImages = updatedAlbums[albumIdx].images.filter((_, i) => i !== imgIdx);
        updatedAlbums[albumIdx] = {
          ...updatedAlbums[albumIdx],
          images: updatedImages,
          count: updatedImages.length,
          cover: updatedImages[0] || null
        };
      }
      return { ...prev, albums: updatedAlbums };
    });
  };

  const tabs = ["Profile", "Price", "Project"];

  return (
    <VendorLayout title="Vendor Profile">
      <input type="file" ref={albumInputRef} id="album-input" onChange={handleAlbumUpload} className="hidden" accept="image/*" multiple />
      <input type="file" ref={bannerInputRef} onChange={(e) => handleFileUpload(e, 'banner')} className="hidden" accept="image/*" />
      <input type="file" ref={portfolioInputRef} onChange={(e) => handleFileUpload(e, 'portfolio')} className="hidden" accept="image/*" multiple />

      {/* Root Wrapper to separate animated content from fixed overlays */}
      <div className="relative min-h-full">
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-5 animate-wedding-fade-up px-1 md:px-0">
               
               {/* Tab Bar - Compact & Non-Scrolling */}
               <div className="flex w-full md:w-fit items-center gap-2 md:gap-3 bg-white p-1 md:p-2 rounded-[1.2rem] md:rounded-[2rem] border border-[#F3E9E2] shadow-sm overflow-hidden">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3.5 rounded-[0.8rem] md:rounded-[1.5rem] text-[10px] md:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                        activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-[#8E7E77] hover:bg-[#F3E9E2]/30"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
               </div>

               {/* SECTION 1: PROFILE - Aggressively Compact */}
               {activeTab === "Profile" && (
                 <div className="bg-white rounded-[1.2rem] md:rounded-[2rem] border border-[#F3E9E2] p-4 md:p-7 shadow-sm space-y-4 md:space-y-6 animate-wedding-fade-in">
                    <div className="flex items-center gap-2 mb-1 text-left">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                           <Info className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <h3 className="text-base md:text-xl font-black text-[#4A3730]">Profile Identity</h3>
                    </div>

                    <div className="space-y-4 md:space-y-8">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-[#8E7E77] uppercase tracking-[0.2em] ml-1">Banner</label>
                          <div className="relative h-24 md:h-40 rounded-xl md:rounded-[1.5rem] overflow-hidden border border-[#F3E9E2] bg-slate-50 group">
                             <img src={vendorData.banner} alt="" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/20 md:opacity-0 md:group-hover:opacity-100 transition-all flex items-center justify-center">
                                <button onClick={() => bannerInputRef.current?.click()} className="px-5 py-2 rounded-xl bg-white/90 backdrop-blur text-primary font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                                   <Camera className="w-4 h-4" /> Edit
                                </button>
                             </div>
                          </div>
                       </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-[#8E7E77] uppercase tracking-widest ml-1">Business Name</label>
                              <div className="relative flex items-center group">
                                 <Layout className="absolute left-3.5 w-4 h-4 text-slate-400" />
                                 <input name="name" value={vendorData.name} onChange={handleChange} className="w-full h-11 md:h-14 bg-[#F3E9E2]/20 border border-[#F3E9E2] rounded-xl pl-10 pr-5 text-[13px] md:text-sm font-bold text-[#4A3730] outline-none" placeholder="Business Name" />
                              </div>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-[#8E7E77] uppercase tracking-widest ml-1">Location</label>
                              <div className="relative flex items-center group">
                                 <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400 z-10" />
                                 <select 
                                   name="location" 
                                   value={vendorData.location} 
                                   onChange={handleChange} 
                                   className="w-full h-11 md:h-14 bg-[#F3E9E2]/20 border border-[#F3E9E2] rounded-xl pl-10 pr-10 text-[13px] md:text-sm font-bold text-[#4A3730] outline-none appearance-none"
                                 >
                                   <option value="">Select Location</option>
                                   {destinations.map(d => (
                                     <option key={d._id || d.id} value={d.name}>{d.name}</option>
                                   ))}
                                   {!destinations.length && <option disabled>Loading destinations...</option>}
                                 </select>
                                 <ChevronDown className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-[#8E7E77] uppercase tracking-widest ml-1">About</label>
                           <textarea name="about" value={vendorData.about} onChange={handleChange} rows={2} className="w-full bg-[#F3E9E2]/20 border border-[#F3E9E2] rounded-xl px-5 py-3 text-[13px] md:text-sm font-medium text-[#4A3730] outline-none resize-none" placeholder="About your work..." />
                        </div>

                        <button onClick={() => setActiveTab("Price")} className="w-full py-4 rounded-xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                           Next Step <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                 </div>
               )}

               {/* SECTION 2: PRICE - Denser & Compact */}
               {activeTab === "Price" && (
                 <div className="bg-white rounded-[1.2rem] md:rounded-[2rem] border border-[#F3E9E2] p-4 md:p-7 shadow-sm space-y-4 animate-wedding-fade-in">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                           <DollarSign className="w-4 h-4" />
                        </div>
                        <h3 className="text-base md:text-xl font-black text-[#4A3730]">Pricing</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {/* Base Package */}
                       <div className="relative p-4 md:p-7 rounded-2xl md:rounded-[2.5rem] border border-[#F3E9E2] bg-[#F3E9E2]/10 space-y-3 md:space-y-6">
                          <div className="flex items-center gap-2">
                             <Layers className="w-3.5 h-3.5 text-primary" />
                             <span className="text-[9px] font-black text-primary uppercase tracking-widest">Base Tier</span>
                          </div>
                          <div className="space-y-3">
                             <div className="space-y-1">
                                <label className="text-[8px] font-black text-[#8E7E77] uppercase tracking-wider ml-1">Price</label>
                                <div className="relative flex items-center">
                                   <span className="absolute left-4 text-xs font-black text-[#4A3730]">₹</span>
                                   <input 
                                     value={vendorData.basePackage.price.replace('₹', '').trim()} 
                                     onChange={(e) => handlePackageChange('basePackage', 'price', `₹ ${e.target.value.replace('₹', '').trim()}`)} 
                                     className="w-full bg-white border border-[#F3E9E2] rounded-xl pl-8 pr-4 py-2.5 text-xs font-black text-[#4A3730] outline-none" 
                                     placeholder="0.00"
                                   />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[8px] font-black text-[#8E7E77] uppercase tracking-wider ml-1">Included</label>
                                <textarea value={vendorData.basePackage.features} onChange={(e) => handlePackageChange('basePackage', 'features', e.target.value)} className="w-full bg-white border border-[#F3E9E2] rounded-xl px-4 py-2 text-[10px] font-medium text-[#4A3730] h-20 outline-none resize-none" placeholder="e.g. 1 Photographer" />
                             </div>
                          </div>
                       </div>

                       {/* Premium Package */}
                       <div className="relative p-4 md:p-7 rounded-2xl md:rounded-[2.5rem] border border-primary/10 bg-primary/5 space-y-3 md:space-y-6">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Premium</span>
                             </div>
                             <div className="bg-primary/10 text-primary text-[7px] font-black uppercase px-2 rounded-full">Best</div>
                          </div>
                          <div className="space-y-3">
                             <div className="space-y-1">
                                <label className="text-[8px] font-black text-[#8E7E77] uppercase tracking-wider ml-1">Price</label>
                                <div className="relative flex items-center">
                                   <span className="absolute left-4 text-xs font-black text-[#4A3730]">₹</span>
                                   <input 
                                     value={vendorData.premiumPackage.price.replace('₹', '').trim()} 
                                     onChange={(e) => handlePackageChange('premiumPackage', 'price', `₹ ${e.target.value.replace('₹', '').trim()}`)} 
                                     className="w-full bg-white border border-[#F3E9E2] rounded-xl pl-8 pr-4 py-2.5 text-xs font-black text-[#4A3730] outline-none" 
                                     placeholder="0.00"
                                   />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[8px] font-black text-[#8E7E77] uppercase tracking-wider ml-1">Included</label>
                                <textarea value={vendorData.premiumPackage.features} onChange={(e) => handlePackageChange('premiumPackage', 'features', e.target.value)} className="w-full bg-white border border-[#F3E9E2] rounded-xl px-4 py-2 text-[10px] font-medium text-[#4A3730] h-20 outline-none resize-none" placeholder="e.g. Full Team + Drone" />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-3">
                       <button onClick={() => setActiveTab("Profile")} className="flex-1 py-4 bg-white border border-[#F3E9E2] text-[#8E7E77] font-black uppercase text-[10px] rounded-xl">Back</button>
                       <button onClick={() => setActiveTab("Project")} className="flex-[2] py-4 bg-primary text-white font-black uppercase text-[10px] rounded-xl shadow-lg">Next: Project</button>
                    </div>
                 </div>
               )}

               {/* SECTION 3: PROJECT - High Density */}
               {activeTab === "Project" && (
                 <div className="bg-white rounded-[1.2rem] md:rounded-[2rem] border border-[#F3E9E2] p-4 md:p-7 shadow-sm space-y-4 animate-wedding-fade-in">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                           <Layout className="w-4 h-4" />
                        </div>
                        <h3 className="text-base md:text-xl font-black text-[#4A3730]">Projects</h3>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#F3E9E2]/30 p-1 rounded-xl w-fit">
                       {["Portfolio", "Albums", "Videos"].map(tab => (
                          <button key={tab} onClick={() => setActiveWorkTab(tab)} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeWorkTab === tab ? "bg-primary text-white shadow-md shadow-primary/20" : "text-[#8E7E77] hover:bg-white"}`}>{tab}</button>
                       ))}
                    </div>

                    <div className="min-h-[200px]">
                       {activeWorkTab === "Portfolio" && (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                              <button onClick={() => portfolioInputRef.current?.click()} className="aspect-square rounded-2xl border border-dashed border-[#F3E9E2] bg-[#F3E9E2]/10 flex flex-col items-center justify-center gap-1">
                                 <Plus className="w-5 h-5 text-primary" />
                                 <span className="text-[7px] font-black uppercase text-[#8E7E77]">Upload</span>
                              </button>
                             {vendorData.portfolio.map((img, idx) => (
                               <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-[#F3E9E2] relative group">
                                  <img src={img} alt="" className="w-full h-full object-cover" />
                                  <button onClick={() => setVendorData(prev => ({ ...prev, portfolio: prev.portfolio.filter((_, i) => i !== idx) }))} className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-black/40 text-white flex items-center justify-center backdrop-blur-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                               </div>
                             ))}
                          </div>
                       )}

                       {activeWorkTab === "Albums" && (
                            <div className="grid grid-cols-2 gap-3">
                               <button onClick={handleAddAlbum} className="py-8 border border-dashed border-[#F3E9E2] bg-[#F3E9E2]/5 rounded-2xl flex flex-col items-center justify-center gap-2">
                                  <PlusCircle className="w-6 h-6 text-primary" />
                                  <span className="text-[9px] font-black uppercase text-[#8E7E77]">New Album</span>
                               </button>
                               {vendorData.albums.map((album, idx) => (
                                 <div key={idx} onClick={() => setViewingGallery(idx)} className="flex flex-col gap-1.5 cursor-pointer group">
                                   <div className="aspect-video rounded-2xl overflow-hidden border border-[#F3E9E2] relative">
                                      <img src={album.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                                         <h4 className="text-white text-xs font-black leading-tight truncate">{album.name}</h4>
                                         <span className="text-white/80 text-[9px] font-bold mt-0.5">{album.images.length} Photos</span>
                                      </div>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemoveAlbum(idx); }} 
                                        className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/50 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 z-10"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                   </div>
                                   {album.images.length > 1 && (
                                     <div className="flex gap-1.5 w-full">
                                       {album.images.slice(1, 5).map((img, i) => (
                                         <div key={i} className="flex-1 aspect-[4/3] rounded-lg overflow-hidden border border-[#F3E9E2] bg-[#F3E9E2]/10">
                                           <img src={img} alt="" className="w-full h-full object-cover" />
                                         </div>
                                       ))}
                                       {album.images.length > 5 && (
                                         <div className="flex-1 aspect-[4/3] rounded-lg bg-[#F3E9E2]/30 border border-[#F3E9E2] flex items-center justify-center text-[#4A3730] text-[10px] font-black shadow-inner">
                                           +{album.images.length - 5}
                                         </div>
                                       )}
                                     </div>
                                   )}
                                 </div>
                               ))}
                            </div>
                       )}
                       
                       {activeWorkTab === "Videos" && (
                          <div className="space-y-2">
                             <div className="p-4 border-2 border-dashed border-[#F3E9E2] bg-[#F3E9E2]/5 rounded-2xl flex flex-col items-center gap-3">
                                <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video link / YouTube link" className="w-full bg-white border border-[#F3E9E2] rounded-xl px-4 py-2 text-[10px] font-bold outline-none" />
                                <button onClick={handleAddVideo} className="w-full bg-primary text-white text-[9px] font-black uppercase py-2.5 rounded-lg">Add Video</button>
                             </div>
                             {vendorData.videos.map((vid, idx) => (
                               <div key={idx} className="flex items-center justify-between p-3 bg-white border border-[#F3E9E2] rounded-xl">
                                  <span className="text-[10px] font-bold text-[#4A3730] truncate flex-1">{vid}</span>
                                  <button onClick={() => handleRemoveVideo(idx)} className="ml-2 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                               </div>
                             ))}
                          </div>
                       )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={handleSave} className="flex-1 bg-primary text-white font-black uppercase text-[10px] py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" /> Save
                      </button>
                      <button onClick={() => setActiveTab("Price")} className="px-6 bg-white border border-[#F3E9E2] text-[#8E7E77] font-black uppercase text-[10px] py-4 rounded-xl">Back</button>
                    </div>
                 </div>
               )}
          </div>

          {/* Success Toast - Root Positioned */}
          {showToast && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] animate-wedding-slide-down px-4 w-full max-w-[320px]">
               <div className="bg-[#4A3730] text-white px-6 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400 flex items-center justify-center text-[#4A3730] shrink-0">
                     <Check className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Profile Updated!</p>
               </div>
            </div>
          )}

          {/* Full Page Overlays - Root Positioned Outside Animations */}
          {showAlbumForm && (
            <div className="fixed inset-0 z-[500] bg-white/40 backdrop-blur-xl p-4 flex items-center justify-center animate-wedding-fade-in overflow-hidden">
               <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm space-y-5 shadow-2xl border border-white/20 animate-wedding-scale-in">
                  <h4 className="text-sm font-black text-[#4A3730] uppercase tracking-wider">New Album</h4>
                  <div className="space-y-3">
                     <input placeholder="Album Title" value={albumForm.name} onChange={(e) => setAlbumForm(prev => ({ ...prev, name: e.target.value }))} className="w-full h-11 border border-[#F3E9E2] rounded-xl px-4 text-xs font-bold outline-none focus:border-primary transition-all" />
                     <div className="relative">
                       <select 
                         value={albumForm.location} 
                         onChange={(e) => setAlbumForm(prev => ({ ...prev, location: e.target.value }))} 
                         className="w-full h-11 border border-[#F3E9E2] rounded-xl px-4 text-xs font-bold outline-none appearance-none bg-white focus:border-primary"
                       >
                         <option value="">Select Location</option>
                         {destinations.map(d => <option key={d._id || d.id} value={d.name}>{d.name}</option>)}
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                     </div>
                     <button onClick={triggerAlbumUpload} className="w-full py-3.5 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">Select Photos</button>
                     <button onClick={() => setShowAlbumForm(false)} className="w-full py-3.5 text-[#8E7E77] font-black uppercase text-[10px] hover:text-primary transition-colors">Cancel</button>
                  </div>
               </div>
            </div>
          )}

          {/* Gallery Viewer Overlay */}
          {viewingGallery !== false && vendorData.albums[viewingGallery] && (
            <div className="fixed inset-0 z-[600] bg-white/90 backdrop-blur-xl p-4 md:p-8 flex flex-col animate-wedding-fade-in overflow-y-auto">
               <div className="max-w-5xl mx-auto w-full space-y-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <h2 className="text-xl md:text-2xl font-black text-[#4A3730] uppercase tracking-wider">{vendorData.albums[viewingGallery].name}</h2>
                        <p className="text-xs font-bold text-[#8E7E77] uppercase tracking-widest">{vendorData.albums[viewingGallery].images.length} Photos • {vendorData.albums[viewingGallery].location}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={() => albumInputRef.current?.click()} className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all">
                           <Plus className="w-4 h-4" /> Add Photos
                        </button>
                        <button onClick={() => setViewingGallery(false)} className="px-5 py-2.5 bg-white border border-[#F3E9E2] rounded-xl flex items-center justify-center gap-2 text-[#4A3730] font-black uppercase text-[10px] tracking-widest hover:bg-[#F3E9E2]/30 transition-colors shadow-sm">
                           <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                     {vendorData.albums[viewingGallery].images.map((img, idx) => (
                       <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-[#F3E9E2] relative group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRemoveGalleryImage(viewingGallery, idx); }} 
                            className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/50 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                     ))}
                     {vendorData.albums[viewingGallery].images.length === 0 && (
                       <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#8E7E77] border-2 border-dashed border-[#F3E9E2] rounded-3xl">
                          <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                          <p className="text-xs font-black uppercase tracking-widest">No Photos Yet</p>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          )}
      </div>
    </VendorLayout>
  );
};

export default ProfileEditor;

