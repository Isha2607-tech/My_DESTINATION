import React, { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Archive,
  MoreVertical,
  User,
  Search,
  MessageCircle,
  TrendingUp,
  Clock,
  CheckCheck,
  Inbox,
  Sparkles,
  ChevronLeft,
  IndianRupee
} from "lucide-react";
import VendorLayout from "../layouts/VendorLayout";
import { weddingVendorService } from "../../../../../services/apiService";
import { format } from "date-fns";


// Vendor-side status config
const STATUS_CONFIG = {
  New: {
    label: "New",
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-400",
    border: "border-blue-100",
  },
  Contacted: {
    label: "Contacted",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
    border: "border-emerald-100",
  },
  Booked: {
    label: "Booked",
    bg: "bg-purple-50",
    text: "text-purple-600",
    dot: "bg-purple-500",
    border: "border-purple-100",
  },
  Lost: {
    label: "Lost",
    bg: "bg-rose-50",
    text: "text-rose-500",
    dot: "bg-rose-400",
    border: "border-rose-100",
  },
};

// Toast notification component
const Toast = ({ message, type, visible }) => {
  const colors = {
    Contacted: "bg-emerald-500",
    Lost: "bg-rose-500",
    Booked: "bg-purple-500",
  };
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3.5 rounded-2xl shadow-2xl text-white text-[12px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-400 ${
        colors[type] || "bg-slate-700"
      } ${visible ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
    >
      {type === "Booked" && <CheckCircle className="w-4 h-4" />}
      {type === "Lost" && <XCircle className="w-4 h-4" />}
      {message}
    </div>
  );
};

const LeadsInbox = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await weddingVendorService.getLeads();
      setLeads(data);
      if (data.length > 0 && !selectedLead) {
        setSelectedLead(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetStatus = async (id, status) => {
    try {
      await weddingVendorService.updateLeadStatus(id, status);
      
      // Update local state
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      if (selectedLead && selectedLead._id === id) {
        setSelectedLead(prev => ({ ...prev, status }));
      }

      const messages = {
        Contacted: "Marked as Contacted!",
        Lost: "Request Rejected",
        Booked: "Marked as Booked!",
      };
      setToast({ visible: true, message: messages[status], type: status });
      setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handlePaymentReceived = async (id) => {
    try {
      await weddingVendorService.markPaymentReceived(id);
      
      // Update local state
      setLeads(prev => prev.map(l => l._id === id ? { ...l, vendorPaymentStatus: 'Received' } : l));
      if (selectedLead && selectedLead._id === id) {
        setSelectedLead(prev => ({ ...prev, vendorPaymentStatus: 'Received' }));
      }

      setToast({ visible: true, message: "Payment marked as Received!", type: "Booked" });
      setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800);
    } catch (error) {
      console.error("Failed to update payment status", error);
    }
  };

  const handleDeleteLead = (id) => {
    // Note: We don't have a specific vendor-delete lead yet, usually we just archive/reject
    if (window.confirm("Are you sure you want to archive this lead?")) {
      handleSetStatus(id, 'Lost');
    }
  };

  // Filter tabs
  const filters = ["All", "New", "Contacted", "Booked", "Lost"];

   const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.message && l.message.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = activeFilter === "All" || l.status === activeFilter;
    return matchesSearch && matchesFilter;
  });


  const currentStatus = selectedLead ? selectedLead.status : "New";
  const currentStatusStyle = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.New;

  const formatDate = (date) => {
    if (!date) return "TBD";
    try {
      return format(new Date(date), "dd MMM yyyy");
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <VendorLayout title="Leads Inbox">
      <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-wedding-fade-up">

        {/* LEFT: Inbox List */}
        <div className="w-full md:w-[360px] flex flex-col gap-4 h-full shrink-0">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#B06A6C] transition-colors" />
            <input
              placeholder="Search Leads..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#F3E9E2] rounded-[2rem] text-sm font-bold text-slate-800 outline-none focus:border-[#B06A6C]/30 focus:shadow-lg focus:shadow-[#B06A6C]/5 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Lead Cards */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                 <div className="w-8 h-8 border-4 border-[#B06A6C] border-t-transparent rounded-full animate-spin" />
                 <p className="text-[10px] font-bold text-[#8E7E77] uppercase tracking-widest">Loading Leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F3E9E2]/60 flex items-center justify-center">
                  <Inbox className="w-6 h-6 text-[#B06A6C]/40" />
                </div>
                <p className="text-xs font-bold text-[#8E7E77]">No leads found</p>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const sStyle = STATUS_CONFIG[lead.status] || STATUS_CONFIG.New;
                const isSelected = selectedLead?._id === lead._id;
                return (
                  <button
                    key={lead._id}
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowMobileDetail(true);
                    }}
                    className={`w-full text-left p-3.5 md:p-4 rounded-[1.5rem] md:rounded-[1.75rem] border transition-all duration-300 group ${
                      isSelected
                        ? "bg-[#B06A6C] border-transparent shadow-xl shadow-[#B06A6C]/20"
                        : "bg-white border-[#F3E9E2] hover:border-[#B06A6C]/20 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-11 md:h-11 rounded-[0.85rem] md:rounded-2xl bg-[#F3E9E2] flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                        <User className={`w-5 h-5 ${isSelected ? "text-white/40" : "text-[#B06A6C]/30"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4
                            className={`text-sm font-black truncate ${
                              isSelected ? "text-white" : "text-[#4A3730]"
                            }`}
                          >
                            {lead.name}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-[10px] font-bold uppercase tracking-widest leading-none flex items-center gap-1 ${
                              isSelected ? "text-white/75" : "text-[#8E7E77]"
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            Event Date: {formatDate(lead.weddingDate)}
                          </p>
                          <span
                            className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 transition-all duration-300 ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : `${sStyle.bg} ${sStyle.text} border ${sStyle.border}`
                            }`}
                          >
                            {!isSelected && (
                              <span className={`w-1.5 h-1.5 rounded-full ${sStyle.dot} shrink-0`} />
                            )}
                            {lead.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Detail Card */}
        <div className="hidden md:flex flex-1 h-full items-start  justify-center">
          <div className="w-full max-w-[520px] bg-white rounded-[1.75rem] border border-[#F3E9E2] shadow-xl shadow-[#4A3730]/5 flex flex-col overflow-hidden">
            {selectedLead ? (
              <>
                <div className="flex items-center justify-between p-5 border-b border-[#F3E9E2]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[1rem] bg-[#F3E9E2] flex items-center justify-center border-2 border-[#B06A6C]/10 shadow-md shrink-0">
                      <User className="w-6 h-6 text-[#B06A6C]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#4A3730] leading-tight">
                        {selectedLead.name}
                      </h3>
                      <div className="flex items-center gap-3 text-[9px] font-bold text-[#8E7E77] uppercase tracking-widest mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 text-[#B06A6C]" />
                          <span className="opacity-70">Event Date:</span> {formatDate(selectedLead.weddingDate)}
                        </span>
                        {selectedLead.bookingAmount > 0 ? (
                          <span className="font-black text-[#B06A6C]">Final Booking: ₹{selectedLead.bookingAmount}</span>
                        ) : (
                          selectedLead.budget && <span className="font-black text-[#B06A6C]">Budget: {selectedLead.budget}</span>
                        )}
                        {selectedLead.guestCount && (
                          <span className="text-slate-400">
                             • {selectedLead.guestCount} Guests
                          </span>
                        )}
                        {selectedLead.vendorPaymentStatus === 'Received' && (
                          <span className="font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                             <CheckCircle className="w-2.5 h-2.5" /> Payment Received
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Live Status Badge */}
                    <span
                      className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all duration-500 ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${currentStatusStyle.dot}`}
                      />
                      {currentStatusStyle.label}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-col gap-4 p-5 overflow-y-auto no-scrollbar">
                  {/* Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#B06A6C] shrink-0 border border-[#F3E9E2]">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="bg-[#F3E9E2]/30 p-4 rounded-[1.5rem] rounded-tl-lg border border-[#F3E9E2]/60 flex-1">
                      <p className="text-[13px] text-[#4A3730] font-medium leading-relaxed">
                        "{selectedLead.message}"
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="ml-11 grid grid-cols-2 gap-3">
                    <div className="bg-[#FFFDFB] p-3 rounded-xl border border-dotted border-[#F3E9E2] flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[#8E7E77] opacity-60">
                          Mobile Number
                        </p>
                        <p className="text-[11px] font-bold text-[#4A3730] truncate">
                          {selectedLead.phone}
                        </p>
                      </div>
                    </div>
                    <div className="bg-[#FFFDFB] p-3 rounded-xl border border-dotted border-[#F3E9E2] flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-400 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[#8E7E77] opacity-60">
                          Email Address
                        </p>
                        <p className="text-[11px] font-bold text-[#4A3730] truncate">
                          {selectedLead.email}
                        </p>
                      </div>
                    </div>
                  </div>


                </div>

                {/* Status Action Buttons */}
                <div className="px-5 pb-5 space-y-3 border-t border-[#F3E9E2] pt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#8E7E77]/70">
                    Update Status
                  </p>

                  <div className="flex items-center gap-2">
                    {/* Contacted */}
                    {(currentStatus === "New" || currentStatus === "Contacted") && (
                      <button
                        onClick={() => handleSetStatus(selectedLead._id, "Contacted")}
                        className={`flex-1 py-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 ${
                          currentStatus === "Contacted"
                            ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-xl shadow-emerald-500/30 border-2 border-emerald-500 scale-[1.02]"
                            : "bg-white text-emerald-600 hover:bg-emerald-50 border-2 border-emerald-400 shadow-sm hover:shadow-emerald-500/10"
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Contacted
                      </button>
                    )}
                    {/* Lost */}
                    {(currentStatus === "New" || currentStatus === "Contacted" || currentStatus === "Lost") && (
                      <button
                        onClick={() => handleSetStatus(selectedLead._id, "Lost")}
                        className={`flex-1 py-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 ${
                          currentStatus === "Lost"
                            ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-xl shadow-rose-500/30 border-2 border-rose-500 scale-[1.02]"
                            : "bg-white text-rose-600 hover:bg-rose-50 border-2 border-rose-400 shadow-sm hover:shadow-rose-500/10"
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    )}
                    {/* Booked */}
                    {(currentStatus === "New" || currentStatus === "Contacted" || currentStatus === "Booked") && (
                      <button
                        onClick={() => handleSetStatus(selectedLead._id, "Booked")}
                        className={`flex-1 py-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 ${
                          currentStatus === "Booked"
                            ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl shadow-purple-500/30 border-2 border-purple-500 scale-[1.02]"
                            : "bg-white text-purple-600 hover:bg-purple-50 border-2 border-purple-400 shadow-sm hover:shadow-purple-500/10"
                        }`}
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Booked
                      </button>
                    )}
                  </div>

                  {currentStatus === "Booked" && selectedLead.vendorPaymentStatus !== "Received" && (
                     <button
                       onClick={() => handlePaymentReceived(selectedLead._id)}
                       className="w-full py-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all duration-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-2 border-emerald-300 active:scale-95"
                     >
                       <IndianRupee className="w-3.5 h-3.5" />
                       Mark Payment Received
                     </button>
                  )}

                  {currentStatus === "Booked" && selectedLead.vendorPaymentStatus === "Received" && (
                     <div className="w-full py-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 bg-slate-50 text-emerald-600 border-2 border-emerald-100">
                       <CheckCheck className="w-3.5 h-3.5" />
                       Payment Received Successfully
                     </div>
                  )}

                  {/* WhatsApp + Archive */}
                  <div className="flex items-center gap-2">
                    <button className="flex-1 py-2.5 bg-[#F3E9E2] text-[#B06A6C] font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#e8d5cc] active:scale-95 transition-all">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Contact on WhatsApp
                    </button>
                    <button 
                      onClick={() => handleDeleteLead(selectedLead._id)}
                      className="w-10 h-10 bg-white border border-rose-100 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-50 transition-all shrink-0 active:scale-95 shadow-sm"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="min-h-[340px] flex flex-col items-center justify-center p-8 text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#F3E9E2]/50 flex items-center justify-center text-[#B06A6C]/20 border-2 border-dashed border-[#F3E9E2]">
                  <Inbox className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-[#4A3730]">Select a Lead</h3>
                  <p className="text-[#8E7E77] text-xs font-medium">
                    Click on an enquiry to view full details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile fallback */}
        {!selectedLead && (
          <div className="md:hidden text-center py-20 px-8 text-slate-300">
            <p>Select a lead from the list to view details.</p>
          </div>
        )}

        {/* Mobile Detail Overlay */}
        {showMobileDetail && selectedLead && (
          <div className="md:hidden fixed inset-0 z-40 bg-gradient-to-tr from-[#F7F1ED] via-[#F3E9E2] to-[#FDFBF9] backdrop-blur-xl animate-wedding-fade-up overflow-y-auto no-scrollbar pb-24">
            <div className="p-4 pt-16 relative">
              {/* Floating Back Button */}
              <button 
                onClick={() => setShowMobileDetail(false)}
                className="absolute top-5 left-6 w-10 h-10 rounded-xl bg-white shadow-lg border border-[#F3E9E2] text-[#B06A6C] flex items-center justify-center z-20 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex flex-col gap-5">
                {/* Profile Header Segment */}
                <div className="bg-white rounded-[2rem] border border-[#F3E9E2] p-5 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[1rem] bg-[#F3E9E2] flex items-center justify-center border-2 border-[#B06A6C]/10 shadow-md shrink-0">
                      <User className="w-6 h-6 text-[#B06A6C]" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#4A3730] leading-tight">{selectedLead.name}</h3>
                      <div className="flex items-center gap-3 text-[9px] font-bold text-[#8E7E77] uppercase tracking-widest mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 text-[#B06A6C]" />
                          <span className="opacity-70">Event Date:</span> {formatDate(selectedLead.weddingDate)}
                        </span>
                        {selectedLead.bookingAmount > 0 ? (
                          <span className="font-black text-[#B06A6C]">Final Booking: ₹{selectedLead.bookingAmount}</span>
                        ) : (
                          selectedLead.budget && <span className="font-black text-[#B06A6C]">Budget: {selectedLead.budget}</span>
                        )}
                        {selectedLead.vendorPaymentStatus === 'Received' && (
                          <span className="font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                             <CheckCircle className="w-2.5 h-2.5" /> Received
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full border ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}>
                    {currentStatusStyle.label}
                  </span>
                </div>

                {/* Message Segment */}
                <div className="bg-white rounded-[2rem] border border-[#F3E9E2] p-6 shadow-sm">
                   <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="w-4 h-4 text-[#B06A6C]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#B06A6C]">Inquiry Message</span>
                   </div>
                   <p className="text-[13px] text-[#4A3730] font-medium leading-relaxed italic opacity-80">
                    "{selectedLead.message || "No message provided."}"
                   </p>
                </div>

                {/* Contact Segment */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white p-4 rounded-[1.5rem] border border-[#F3E9E2] shadow-sm flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-[#8E7E77] opacity-60">Mobile Number</p>
                      <p className="text-[12px] font-bold text-[#4A3730]">{selectedLead.phone}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-[1.5rem] border border-[#F3E9E2] shadow-sm flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-400 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-[#8E7E77] opacity-60">Email Address</p>
                      <p className="text-[12px] font-bold text-[#4A3730] break-all">{selectedLead.email}</p>
                    </div>
                  </div>
                </div>

                {/* Status Update Segment */}
                <div className="bg-white rounded-[2.5rem] border border-[#F3E9E2] p-5 shadow-sm space-y-4">
                   <p className="text-[9px] font-black uppercase tracking-widest text-[#8E7E77] text-center">Update Enquiry Status</p>
                   <div className="flex flex-col gap-3">
                      {(currentStatus === "New" || currentStatus === "Contacted") && (
                        <button onClick={() => handleSetStatus(selectedLead._id, "Contacted")} className={`w-full py-4 rounded-xl text-[12px] font-black flex items-center justify-center gap-2 transition-all ${currentStatus === "Contacted" ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-xl shadow-emerald-500/30 border-2 border-emerald-500" : "bg-white text-emerald-600 border-2 border-emerald-400"}`}>
                          <MessageCircle className="w-4 h-4" /> Contacted
                        </button>
                      )}
                      
                      {(currentStatus === "New" || currentStatus === "Contacted") ? (
                        <div className="flex gap-3">
                          <button onClick={() => handleSetStatus(selectedLead._id, "Lost")} className="flex-1 py-4 rounded-xl text-[12px] font-black flex items-center justify-center gap-2 bg-white text-rose-600 border-2 border-rose-400 hover:bg-rose-50 transition-all">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                          <button onClick={() => handleSetStatus(selectedLead._id, "Booked")} className="flex-1 py-4 rounded-xl text-[12px] font-black flex items-center justify-center gap-2 bg-white text-purple-600 border-2 border-purple-400 hover:bg-purple-50 transition-all">
                            <CheckCheck className="w-4 h-4" /> Book
                          </button>
                        </div>
                      ) : (
                        <>
                          {currentStatus === "Lost" && (
                            <button className="w-full py-4 rounded-xl text-[12px] font-black flex items-center justify-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-xl shadow-rose-500/30 border-2 border-rose-500">
                              <XCircle className="w-4 h-4" /> Rejected / Lost
                            </button>
                          )}
                          {currentStatus === "Booked" && (
                            <button className="w-full py-4 rounded-xl text-[12px] font-black flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl shadow-purple-500/30 border-2 border-purple-500">
                              <CheckCheck className="w-4 h-4" /> Booked
                            </button>
                          )}
                        </>
                      )}
                      {currentStatus === "Booked" && selectedLead.vendorPaymentStatus !== "Received" && (
                         <button onClick={() => handlePaymentReceived(selectedLead._id)} className="w-full py-4 rounded-xl text-[12px] font-black flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 border-2 border-emerald-300 transition-all hover:bg-emerald-200">
                           <IndianRupee className="w-4 h-4" /> Mark Payment Received
                         </button>
                      )}
                      {currentStatus === "Booked" && selectedLead.vendorPaymentStatus === "Received" && (
                         <div className="w-full py-4 rounded-xl text-[12px] font-black flex items-center justify-center gap-2 bg-slate-50 text-emerald-600 border-2 border-emerald-100">
                           <CheckCheck className="w-4 h-4" /> Payment Received
                         </div>
                      )}
                   </div>
                   <button className="w-full py-4 bg-[#4A3730] text-white font-black text-[11px] rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#4A3730]/20 hover:scale-[1.02] active:scale-95 transition-all">
                      <MessageCircle className="w-4 h-4" /> Contact on WhatsApp
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
      />
    </VendorLayout>
  );
};

export default LeadsInbox;
