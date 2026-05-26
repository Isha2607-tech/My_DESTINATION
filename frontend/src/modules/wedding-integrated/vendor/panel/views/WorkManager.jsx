import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Camera, 
  Plus, 
  MoreVertical, 
  Play, 
  Trash2, 
  Edit2, 
  Settings2,
  ExternalLink,
  PlusCircle,
  Video
} from "lucide-react";
import VendorLayout from "../layouts/VendorLayout";
import { getVendor, updateVendor } from "../../data/vendorApi";
import { toast } from "react-hot-toast";

const WorkManager = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Portfolio");
  const [viewMode, setViewMode] = useState("hub");
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState(null);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const res = await getVendor();
        if (res.success && res.vendor) {
          setVendorId(res.vendor._id);
          setProjects(res.vendor.projects || []);
        }
      } catch (err) {
        console.error("Failed to fetch vendor data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, []);

  const selectProject = (proj) => {
    setActiveProject(proj);
    setViewMode("gallery");
  };

  const syncToBackend = async (updatedProjects) => {
    try {
      const res = await updateVendor(vendorId, { projects: updatedProjects });
      if (!res.success) throw new Error(res.error || "Failed to update backend");
      setProjects(updatedProjects);
      if (activeProject) {
        const updatedActive = updatedProjects.find(p => p._id === activeProject._id || p.id === activeProject.id);
        setActiveProject(updatedActive || null);
      }
      return true;
    } catch (e) {
      toast.error(e.message || "Failed to save portfolio");
      return false;
    }
  };

  const createNewProject = async () => {
    const newProject = {
      id: Date.now().toString(),
      name: "New Portfolio",
      location: "",
      portfolio: [],
      albums: [],
      videos: [],
      price: { base: 0, type: "total" }
    };
    const updatedProjects = [...projects, newProject];
    const success = await syncToBackend(updatedProjects);
    if (success) {
      const createdProj = updatedProjects[updatedProjects.length - 1];
      setActiveProject(createdProj);
      toast.success("Portfolio created successfully");
    }
  };

  const deleteProject = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this entire portfolio?")) {
      const updated = projects.filter(p => p._id !== id && p.id !== id);
      await syncToBackend(updated);
      
      if (activeProject && (activeProject._id === id || activeProject.id === id)) {
        setActiveProject(null);
        setViewMode("hub");
      }
      toast.success("Portfolio deleted");
    }
  };

  const updateStore = async (newData) => {
    const updatedProjects = projects.map(p => 
      (p._id === newData._id || p.id === newData.id) ? newData : p
    );
    await syncToBackend(updatedProjects);
  };

  const handleDelete = (type, index) => {
    const newData = { ...activeProject };
    if (type === 'portfolio') {
      newData.portfolio = newData.portfolio.filter((_, i) => i !== index);
    } else if (type === 'albums') {
      newData.albums = newData.albums.filter((_, i) => i !== index);
    } else if (type === 'videos') {
      newData.videos = newData.videos.filter((_, i) => i !== index);
    }
    updateStore(newData);
  };


  if (loading) {
    return <VendorLayout title="My Work"><div className="p-8 text-center text-slate-500">Loading your portfolios...</div></VendorLayout>;
  }

  return (
    <VendorLayout title="My Work">
       <div className="space-y-8 animate-wedding-fade-up">
        
        {/* VIEW MODE: PROJECT HUB */}
        {viewMode === "hub" ? (
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-[#F3E9E2] p-5 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-black text-[#4A3730]">My Portfolios</h2>
                  <p className="text-[#8E7E77] text-sm font-medium tracking-wide">Manage your work units across different locations and brands.</p>
                </div>
                <button 
                  onClick={createNewProject}
                  className="flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-[#B06A6C] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#B06A6C]/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Add New Portfolio
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div key={proj._id || proj.id} className="group bg-white rounded-[2rem] md:rounded-[2.5rem] border border-[#F3E9E2] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="aspect-[2.4/1] md:aspect-[16/10] bg-slate-100 relative transition-all duration-700">
                    {proj.portfolio && proj.portfolio[0] ? (
                      <img src={proj.portfolio[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1">
                        <Camera className="w-6 h-6 md:w-8 md:h-8 opacity-20" />
                        <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest opacity-40">No Images</span>
                      </div>
                    )}
                    
                    {/* Floating Action Icons over the image */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 md:translate-x-2 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 transition-all duration-500">
                      <button 
                        onClick={(e) => deleteProject(e, proj._id || proj.id)}
                        className="w-8 h-8 md:w-10 md:h-10 bg-rose-500 shadow-lg shadow-rose-200 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition-all active:scale-90"
                      >
                        <Trash2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3.5 md:p-6">

                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1 pr-2">
                        <h3 className="text-sm md:text-lg font-black text-[#4A3730] leading-tight mb-0.5 truncate">{proj.name || 'Untitled Portfolio'}</h3>
                        <p className="text-[9px] md:text-xs font-bold text-[#8E7E77] uppercase tracking-widest truncate">{proj.location || 'Location Not Set'}</p>
                      </div>
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#F3E9E2]/40 flex items-center justify-center text-[#B06A6C] shrink-0 border border-[#F3E9E2]">
                        <Settings2 className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                    </div>
                    <button 
                      onClick={() => selectProject(proj)}
                      className="w-full py-3.5 md:py-4 rounded-xl bg-[#B06A6C] text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-[#B06A6C]/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Manage Portfolio & Work
                    </button>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 italic">No portfolios created yet.</div>
              )}
            </div>
          </div>
        ) : (
          /* VIEW MODE: GALLERY (Original Tabs) */
          <>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setViewMode("hub")}
                className="flex items-center gap-2 text-[#8E7E77] hover:text-[#B06A6C] transition-colors"
              >
                <PlusCircle className="w-4 h-4 rotate-45" />
                <span className="text-xs font-black uppercase tracking-widest">Back to Portfolios</span>
              </button>
              
              {/* Tab Selection */}
              <div className="flex items-center gap-2 bg-[#F3E9E2]/50 p-1.5 rounded-[1.5rem] w-fit">
                 {["Portfolio", "Albums", "Videos"].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === tab 
                          ? "bg-[#B06A6C] text-white shadow-lg shadow-[#B06A6C]/20" 
                          : "text-[#8E7E77] hover:bg-white"
                      }`}
                    >
                      {tab}
                    </button>
                 ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[2.5rem] border border-[#F3E9E2] p-6 md:p-8 shadow-sm">
               
               {/* Section Header */}
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-[#4A3730] " >
                      {activeProject.name} — {activeTab}
                    </h2>
                    <p className="text-[#8E7E77] text-xs font-medium">Add, remove, or organize your best work pieces for this unit.</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={() => toast.success("Use the main Vendor Profile tab to edit details.")}
                       className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#B06A6C] text-white font-bold text-sm shadow-xl shadow-[#B06A6C]/20 hover:scale-105 transition-all"
                     >
                       <Edit2 className="w-4 h-4" /> Edit Details
                     </button>
                  </div>
               </div>

               {/* --- Portfolio Grid --- */}
               {activeTab === "Portfolio" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {(activeProject.portfolio || []).map((img, i) => (
                       <div key={i} className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50 border border-[#F3E9E2] shadow-sm">
                          <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                             <div className="flex gap-2">
                               <button 
                                 onClick={() => handleDelete('portfolio', i)}
                                 className="w-10 h-10 rounded-xl bg-white text-[#B06A6C] flex items-center justify-center hover:bg-[#B06A6C] hover:text-white transition-all"
                               >
                                 <Trash2 className="w-5 h-5" />
                               </button>
                             </div>
                          </div>
                          <div className="absolute top-4 left-4">
                            <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[9px] font-black uppercase text-slate-700">#{i+1}</span>
                          </div>
                       </div>
                     ))}
                  </div>
               )}

               {/* --- Albums View --- */}
               {activeTab === "Albums" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {(activeProject.albums || []).map((album, idx) => (
                       <div key={idx} className="group relative bg-[#F3E9E2]/20 rounded-[2rem] p-4 border border-transparent hover:border-[#B06A6C]/20 hover:bg-white hover:shadow-xl transition-all duration-300">
                          <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-4 relative">
                            <img src={album.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-3 right-3">
                               <button 
                                 onClick={() => handleDelete('albums', idx)}
                                 className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-lg"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between px-1">
                            <div className="space-y-0.5">
                               <h4 className="text-base font-black text-[#4A3730] " >{album.name}</h4>
                               <p className="text-[11px] font-bold text-[#8E7E77] uppercase tracking-widest leading-none">{album.count} Photos</p>
                            </div>
                          </div>
                       </div>
                     ))}
                  </div>
               )}

               {/* --- Videos View --- */}
               {activeTab === "Videos" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {(activeProject.videos || []).map((vid, idx) => (
                       <div key={idx} className="group relative bg-white rounded-[2rem] overflow-hidden border border-[#F3E9E2] hover:shadow-xl transition-all duration-500">
                          <div className="aspect-video relative overflow-hidden bg-slate-900 flex items-center justify-center">
                            <Play className="w-12 h-12 text-white/40" />
                            <div className="absolute top-4 right-4 flex gap-2">
                                 <button 
                                   onClick={() => handleDelete('videos', idx)}
                                   className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-rose-500 hover:border-transparent transition-all"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                            </div>
                          </div>
                          <div className="p-6 flex items-center justify-between">
                             <div className="space-y-1 overflow-hidden">
                                <h4 className="text-lg font-black text-[#4A3730] truncate" >{vid}</h4>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-[#B06A6C] uppercase tracking-widest">
                                   <Video className="w-3 h-3" />
                                   Wedding Highlight
                                </div>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               )}
            </div>
          </>
        )}
      </div>

    </VendorLayout>
  );
};

export default WorkManager;
