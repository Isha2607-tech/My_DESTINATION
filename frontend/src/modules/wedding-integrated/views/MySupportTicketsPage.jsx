import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, ArrowLeft, Loader2, Clock } from "lucide-react";
import { weddingService } from "../../../services/weddingService";
import ScrollReveal from "../components/ScrollReveal";

const MySupportTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      
      // First try to get tickets from backend if user is logged in
      let allTickets = [];
      try {
        const res = await weddingService.getMySupportTickets();
        if (res.data) allTickets = res.data;
      } catch (err) {
        // Not logged in or error, ignore
      }

      // Also get from localStorage for anonymous users
      const saved = localStorage.getItem('mySupportTickets');
      if (saved) {
        try {
          const parsedIds = JSON.parse(saved);
          if (parsedIds.length > 0) {
            const promises = parsedIds.map(id => weddingService.getTicketById(id));
            const results = await Promise.allSettled(promises);
            const localTickets = results
              .filter(r => r.status === 'fulfilled' && r.value?.data)
              .map(r => r.value.data);
            
            // Merge avoiding duplicates
            const existingIds = new Set(allTickets.map(t => t.ticketId));
            localTickets.forEach(t => {
              if (!existingIds.has(t.ticketId)) {
                allTickets.push(t);
              }
            });
          }
        } catch (e) {
          console.error('Failed to parse saved tickets');
        }
      }

      // Sort by newest first
      allTickets.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setTickets(allTickets);

    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Progress":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "Open":
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafb] pb-20 pt-8 md:pt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-6 md:mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-4 md:mb-6 group"
          >
            <div className="p-2 rounded-full border border-slate-200 group-hover:border-primary transition-colors bg-white shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back
          </button>

          <ScrollReveal>
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl md:text-5xl font-black text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                My Support Tickets
              </h1>
              <p className="text-muted-foreground text-lg">
                Track the status of your help requests and issues
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50 mb-4" />
            <p className="text-muted-foreground font-medium animate-pulse">Loading your tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <ScrollReveal delay={0.1}>
            <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
              <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-primary opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No Support Tickets Yet</h3>
              <p className="text-slate-500 mb-8 max-w-md">
                You haven't raised any support tickets yet. If you have an issue, please submit a request.
              </p>
              <button 
                onClick={() => navigate('/wedding/support')}
                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95"
              >
                Raise a Ticket
              </button>
            </div>
          </ScrollReveal>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket, index) => (
              <ScrollReveal key={ticket._id} delay={index * 0.05}>
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-100 pb-4 gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{ticket.ticketId}</p>
                      <h4 className="text-xl font-bold text-slate-800 mt-1">{ticket.subject}</h4>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap self-start sm:self-auto border ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  {ticket.adminReply ? (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-primary/10 mt-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                      <p className="text-xs font-bold text-primary tracking-wider uppercase mb-2">Admin Reply</p>
                      <p className="text-slate-700 font-medium whitespace-pre-wrap">{ticket.adminReply}</p>
                      <p className="text-xs text-slate-400 mt-4 font-bold flex items-center gap-1.5">
                        <Clock size={12} />
                        Replied on {new Date(ticket.adminRepliedAt).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <Clock size={18} className="text-amber-500" />
                      <p className="text-sm font-medium">We have received your ticket. Our team will review and reply soon.</p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySupportTicketsPage;
