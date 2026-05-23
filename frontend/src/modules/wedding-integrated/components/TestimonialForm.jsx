import React, { useState } from 'react';
import { X, Star, Upload, Send, Camera } from 'lucide-react';
import { weddingService } from '../../../services/weddingService';
import toast from 'react-hot-toast';

const TestimonialForm = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    text: '',
    rating: 5,
    image: ''
  });

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.text || !formData.location) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await weddingService.submitTestimonial(formData);
      toast.success('Thank you! Your story has been submitted for review.');
      onClose();
    } catch (error) {
      toast.error('Failed to submit testimonial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>

        <div className="p-8 md:p-12">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                <Camera size={32} />
             </div>
             <h3 className="text-2xl font-bold italic" style={{ fontFamily: "'Playfair Display', serif" }}>Share Your Love Story</h3>
             <p className="text-slate-500 text-sm mt-1">We'd love to hear about your special day!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Names</label>
                  <input 
                    required
                    placeholder="e.g. Tara & Jay"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value.replace(/[^a-zA-Z\s&'-]/g, '')})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location / Theme</label>
                  <input 
                    required
                    placeholder="e.g. Goa Beach Wedding"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value.replace(/[^a-zA-Z\s,.-]/g, '')})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Story</label>
               <textarea 
                 required
                 placeholder="Tell us about your experience..."
                 value={formData.text}
                 onChange={e => setFormData({...formData, text: e.target.value})}
                 rows={3}
                 className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
               />
            </div>

            <div className="flex items-center justify-between">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                      <button 
                        key={star}
                        type="button"
                        onClick={() => setFormData({...formData, rating: star})}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          size={24} 
                          className={star <= formData.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} 
                        />
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Add a Photo</label>
                  <div className="flex items-center gap-3">
                     <input 
                       type="file" 
                       id="testimonial-image" 
                       accept="image/*" 
                       className="hidden" 
                       onChange={handleImageChange}
                     />
                     <label 
                       htmlFor="testimonial-image"
                       className="w-12 h-12 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all"
                     >
                        {formData.image ? (
                          <img src={formData.image} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                        ) : (
                          <Upload size={20} />
                        )}
                     </label>
                  </div>
               </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-[1.5rem] font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
               {loading ? 'Submitting...' : <><Send size={18} /> Send My Feedback</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestimonialForm;
