import React, { useState, useEffect } from 'react';
import { weddingService } from '../../../../services/weddingService';
import { adminStyles } from '../theme/themeConfig';
import { 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  User, 
  MessageSquare, 
  MapPin, 
  Star,
  Clock,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManageTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await weddingService.getAdminTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await weddingService.updateTestimonialStatus(id, status);
      toast.success(`Testimonial ${status} successfully!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await weddingService.deleteTestimonial(id);
      toast.success('Testimonial deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const filteredData = testimonials.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  if (loading && testimonials.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-serif text-[hsl(353,45%,35%)]">Manage Testimonials</h2>
            <p className="text-gray-500 text-sm mt-1">Review and moderate couple feedback for the homepage</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-white rounded-xl border border-[#B06A6C]/20 p-1 shadow-sm">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                   <button 
                     key={f}
                     onClick={() => setFilter(f)}
                     className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-[hsl(353,45%,35%)] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                     {f}
                   </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {filteredData.map((t) => (
           <div key={t._id} className={`${adminStyles.glassCard} p-6 rounded-[2rem] flex flex-col md:flex-row gap-6 relative group overflow-hidden`}>
              {/* User Info & Status */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 min-w-[200px]">
                 <div className="relative">
                    <img 
                      src={t.image || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=200'} 
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      alt={t.name}
                    />
                    <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border-2 border-white shadow-sm ${
                      t.status === 'approved' ? 'bg-emerald-500 text-white' : 
                      t.status === 'rejected' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                       {t.status === 'approved' ? <CheckCircle2 size={12} /> : 
                        t.status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                    </div>
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-slate-800 leading-tight">{t.name}</h3>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1 flex items-center justify-center md:justify-start gap-1">
                       <MapPin size={10} /> {t.location}
                    </p>
                 </div>
              </div>

              {/* Feedback Content */}
              <div className="flex-1 space-y-4">
                 <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                       <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                 </div>
                 <div className="relative">
                    <MessageSquare className="absolute -left-2 -top-2 w-8 h-8 text-primary/5 -z-0" />
                    <p className="text-slate-600 italic leading-relaxed relative z-10">"{t.text}"</p>
                 </div>
                 <p className="text-[10px] text-gray-400 font-medium">Submitted on {new Date(t.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap md:flex-col justify-center gap-2 min-w-[110px] shrink-0">
                 {t.status !== 'approved' && (
                   <button 
                     onClick={() => handleStatusUpdate(t._id, 'approved')}
                     className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-600 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
                   >
                      <CheckCircle2 size={14} /> Approve
                   </button>
                 )}
                 {t.status !== 'rejected' && (
                   <button 
                     onClick={() => handleStatusUpdate(t._id, 'rejected')}
                     className="flex-1 py-2 px-3 bg-rose-50 text-rose-600 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
                   >
                      <XCircle size={14} /> Reject
                   </button>
                 )}
                 <button 
                   onClick={() => handleDelete(t._id)}
                   className="flex-1 py-2 px-3 bg-slate-50 text-slate-500 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
                 >
                    <Trash2 size={14} /> Delete
                 </button>
              </div>
           </div>
         ))}

         {filteredData.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#B06A6C]/20 rounded-[2.5rem] bg-white/30">
               <MessageSquare size={48} className="text-[#B06A6C]/20 mb-4" />
               <p className="text-gray-400 font-medium">No testimonials found.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ManageTestimonials;
