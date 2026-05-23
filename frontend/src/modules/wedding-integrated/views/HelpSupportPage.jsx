import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, AlertCircle, Phone, HelpCircle, Search, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { weddingService } from '../../../services/weddingService';

const HelpSupportPage = () => {
  const [formData, setFormData] = useState({
    user: '',
    subject: '',
    priority: 2
  });
  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('mySupportTickets');
    if (saved) {
      try {
        const parsedIds = JSON.parse(saved);
        setRecentTickets(parsedIds);
      } catch (e) {
        console.error('Failed to parse saved tickets');
      }
    }
  }, []);

  // Removed smooth scrolling since we have a dedicated page now

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user.trim() || !formData.subject.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const res = await weddingService.createSupportTicket(formData);
      setSubmittedTicket(res.data);
      
      // Save to localStorage
      const updatedTickets = [res.data.ticketId, ...recentTickets.filter(id => id !== res.data.ticketId)].slice(0, 5);
      setRecentTickets(updatedTickets);
      localStorage.setItem('mySupportTickets', JSON.stringify(updatedTickets));

      toast.success('Ticket submitted successfully!');
      setFormData({ user: '', subject: '', priority: 2 });
    } catch (error) {
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface md:pt-32 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
          >
            <HelpCircle size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">Help & Support</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-slate-800 mb-6 leading-tight"
          >
            How can we <span className="text-primary italic">help you?</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg"
          >
            Have a question or facing an issue? Raise a ticket below and our support team will get back to you as soon as possible.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Mail size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Email Us</h3>
              <p className="text-slate-500 mb-4">For general queries and support</p>
              <a href="mailto:support@mydestination.com" className="text-lg font-bold text-primary hover:underline">
                support@mydestination.com
              </a>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Phone size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Call Us</h3>
              <p className="text-slate-500 mb-4">Mon-Fri from 9am to 6pm</p>
              <a href="tel:+919876543210" className="text-lg font-bold text-primary hover:underline">
                +91 98765 43210
              </a>
            </div>
          </motion.div>

          {/* Ticket Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="text-primary" size={28} />
              <h2 className="text-2xl font-bold text-slate-800">Raise a Ticket</h2>
            </div>

            {submittedTicket ? (
              <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Ticket Submitted!</h3>
                <p className="text-slate-600 mb-6">We have received your request. Please save your Ticket ID to track its status.</p>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 inline-block mb-8">
                  <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-widest">Your Ticket ID</p>
                  <p className="text-3xl font-black text-primary font-mono">{submittedTicket.ticketId}</p>
                </div>
                <button
                  onClick={() => setSubmittedTicket(null)}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg hover:bg-slate-900 transition-all active:scale-[0.98]"
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.user}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^[a-zA-Z\s]*$/.test(val)) {
                        setFormData({...formData, user: val});
                      }
                    }}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Issue / Message</label>
                  <textarea
                    placeholder="Describe your issue in detail..."
                    rows="5"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Priority Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: 3, label: 'Low', activeClass: 'bg-green-700 border-green-700 text-white shadow-md shadow-green-200' },
                      { val: 2, label: 'Normal', activeClass: 'bg-[#81313A] border-[#81313A] text-white shadow-md shadow-[#81313A]/20' },
                      { val: 1, label: 'Critical', activeClass: 'bg-red-700 border-red-700 text-white shadow-md shadow-red-200' }
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setFormData({...formData, priority: p.val})}
                        className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 border-2 ${
                          formData.priority === p.val
                            ? p.activeClass
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <div className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <Send size={20} />
                        Submit Ticket
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                    <AlertCircle size={12} /> Our team usually responds within 24 hours.
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default HelpSupportPage;
