import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, ArrowLeft, Calendar, Mail, Phone, MapPin, Loader2, Sparkles } from "lucide-react";
import { weddingEnquiryService } from "../../../services/apiService";
import ScrollReveal from "../components/ScrollReveal";

const MyEnquiriesPage = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const data = await weddingEnquiryService.getMyEnquiries();
      setEnquiries(data || []);
    } catch (error) {
      console.error("Failed to fetch enquiries", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Booked":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Contacted":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Lost":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "New":
      default:
        return "bg-amber-50 text-amber-600 border-amber-100";
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
                My Enquiries
              </h1>
              <p className="text-muted-foreground font-medium">
                Keep track of your conversations with destination planners.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* List of Enquiries */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-slate-500 font-medium">Fetching your enquiries...</p>
          </div>
        ) : enquiries.length > 0 ? (
          <div className="space-y-6">
            {enquiries.map((enq, index) => (
              <ScrollReveal key={enq._id} delay={index * 100}>
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 overflow-hidden relative group hover:shadow-xl transition-shadow duration-500">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-primary mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                          {enq.destination || "Multiple"} Destination
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Enquiry for {enq.weddingDate || "TBD"}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Submitted on {new Date(enq.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className={`self-start md:self-auto px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusBadge(enq.status)}`}>
                      {enq.status || "New"}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg"><Calendar className="w-4 h-4"/></div>
                        <span>Date: <span className="text-slate-900 font-semibold">{enq.weddingDate || "Not Specified"}</span></span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg"><Mail className="w-4 h-4"/></div>
                        <span>{enq.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg"><Phone className="w-4 h-4"/></div>
                        <span>{enq.phone}</span>
                      </div>
                      {enq.services && enq.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {enq.services.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded-md border border-primary/10">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-full">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
                        <MessageSquare className="w-4 h-4" /> Message
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                        "{enq.message || "No additional notes provided."}"
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xl text-foreground font-black mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              No enquiries sent yet
            </p>
            <p className="text-muted-foreground font-medium mb-6">
              Start planning your dream wedding today!
            </p>
            <Link 
              to="/wedding/enquiry"
              className="inline-block px-8 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            >
              Send Your First Enquiry
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEnquiriesPage;
