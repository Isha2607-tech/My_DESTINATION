import React, { useState, useEffect } from 'react';
import { adminStyles } from '../theme/themeConfig';
import { weddingService } from '../../../../services/weddingService';
import toast from 'react-hot-toast';
import { 
  LifeBuoy, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  MoreVertical,
  Mail,
  Filter,
  Search,
  MessageCircle
} from 'lucide-react';

const ManageSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await weddingService.getAdminSupportTickets();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAll = async () => {
    if (!window.confirm("Are you sure you want to resolve all non-resolved tickets?")) return;
    try {
      await weddingService.resolveAllSupportTickets();
      toast.success('All tickets resolved successfully');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to resolve tickets');
    }
  };

  const handleResolveSingle = async (id) => {
    try {
      await weddingService.resolveSupportTicket(id);
      toast.success('Ticket marked as resolved');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to resolve ticket');
    }
  };

  const handleMessage = (ticket) => {
    setActiveTicket(ticket);
    setReplyText(ticket.adminReply || '');
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    try {
      setSubmittingReply(true);
      await weddingService.replyToSupportTicket(activeTicket._id, replyText);
      toast.success('Reply sent successfully!');
      setReplyModalOpen(false);
      fetchTickets();
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    unresolved: tickets.filter(t => t.status === 'Critical' || t.status === 'Open').length,
    pending: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-serif text-[hsl(353,45%,35%)]">Support Desk</h2>
            <p className="text-gray-500 text-sm mt-1">Handle complaints and support requests from users and vendors</p>
          </div>
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tickets..." 
                  className="pl-10 pr-4 py-2 border border-[#B06A6C]/20 bg-white rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#B06A6C]/20"
                />
             </div>
             <button onClick={handleResolveAll} className="flex items-center gap-2 px-6 py-2 bg-[hsl(353,45%,35%)] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 leading-none">
                <CheckCircle2 size={16} /> Resolve All
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Stats */}
         <div className="lg:col-span-1 space-y-4">
            {[
               { label: 'Unresolved', count: stats.unresolved, icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-100' },
               { label: 'Pending', count: stats.pending, icon: Clock, color: 'text-orange-600 bg-orange-50 border-orange-100' },
               { label: 'Resolved', count: stats.resolved, icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-100' },
            ].map((stat, i) => (
               <div key={i} className={`p-6 rounded-3xl border ${stat.color} flex items-center justify-between shadow-sm`}>
                  <div className="flex items-center gap-3">
                     <stat.icon size={22} />
                     <span className="font-bold">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-black">{stat.count}</span>
               </div>
            ))}
         </div>

         {/* Ticket List */}
         <div className="lg:col-span-3 space-y-4">
            {loading && filteredTickets.length === 0 ? (
               <div className="py-20 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
               </div>
            ) : filteredTickets.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#B06A6C]/20 rounded-[2.5rem] bg-white/30">
                 <AlertCircle size={48} className="text-[#B06A6C]/20 mb-4" />
                 <p className="text-gray-400 font-medium">No tickets found.</p>
               </div>
            ) : (
               filteredTickets.map((ticket) => (
                  <div key={ticket._id} className={`${adminStyles.glassCard} p-6 rounded-3xl group flex items-center gap-8 border-[#B06A6C]/5 hover:border-[#B06A6C]/20 hover:shadow-xl transition-all duration-300`}>
                     <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        ticket.priority === 1 ? 'bg-red-50 text-red-600' : 
                        ticket.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'
                     }`}>
                        {ticket.status === 'Resolved' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                     </div>
                     
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#B06A6C]">{ticket.ticketId}</span>
                           <div className="h-1 w-1 rounded-full bg-slate-300" />
                           <span className="text-xs font-bold text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className={`font-bold text-lg leading-tight transition-colors ${ticket.status === 'Resolved' ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-[#B06A6C]'}`}>
                           {ticket.subject}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium">Issue reported by <span className="text-slate-700 font-bold">{ticket.user}</span></p>
                     </div>

                     <div className="flex items-center gap-6">
                        <div className="text-right">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              ticket.status === 'Critical' ? 'bg-red-600 text-white shadow-lg' : 
                              ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                              'bg-slate-100 text-slate-600'
                           }`}>
                              {ticket.status}
                           </span>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleMessage(ticket)} title="View/Send Reply" className={`p-3 border rounded-2xl transition-all shadow-sm ${ticket.adminReply ? 'bg-[#B06A6C] text-white border-[#B06A6C] hover:bg-[#9a5b5d]' : 'bg-white border-[#B06A6C]/10 text-[#B06A6C] hover:bg-[#B06A6C] hover:text-white'}`}>
                              <MessageCircle size={20} />
                           </button>
                           {ticket.status !== 'Resolved' && (
                             <button onClick={() => handleResolveSingle(ticket._id)} title="Resolve Ticket" className="p-3 bg-white border border-[#B06A6C]/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                <CheckCircle2 size={20} />
                             </button>
                           )}
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>

      {/* Reply Modal */}
      {replyModalOpen && activeTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative">
            <button 
              onClick={() => setReplyModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              &times;
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-[#B06A6C]/10 text-[#B06A6C] flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Reply to Ticket</h3>
                <p className="text-sm font-bold text-[#B06A6C] uppercase tracking-widest">{activeTicket.ticketId}</p>
              </div>
            </div>

            <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-500 font-bold mb-1">User's Issue ({activeTicket.user}):</p>
              <p className="text-slate-800 font-medium">{activeTicket.subject}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Your Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B06A6C]/20 focus:border-[#B06A6C] transition-all resize-none h-32"
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setReplyModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={submittingReply}
                  className="flex-1 py-4 bg-[#B06A6C] text-white rounded-2xl font-bold hover:bg-[#9a5b5d] transition-all flex items-center justify-center gap-2"
                >
                  {submittingReply ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Send Reply'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSupport;
