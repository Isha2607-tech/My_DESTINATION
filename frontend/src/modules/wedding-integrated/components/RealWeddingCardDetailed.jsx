import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PlanWeddingModal from "./PlanWeddingModal";

const RealWeddingCardDetailed = ({ wedding }) => {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] group">
        {/* Cover Image */}
        <div 
          className="relative aspect-[2.2/1] overflow-hidden cursor-pointer" 
          onClick={() => navigate(`/wedding/real-weddings/gallery/${wedding.id}`)}
        >
          <img
            src={wedding.coverImage}
            alt={wedding.coupleName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* Info */}
        <div className="p-3 sm:p-3.5">
          <div className="mb-1.5">
            <h3 className="text-base font-bold text-foreground mb-0 transition-colors group-hover:text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
              {wedding.location}
            </h3>
            <p className="text-[9px] text-muted-foreground font-medium">
              {wedding.guests} guests
            </p>
          </div>

          {/* Budget Box */}
          <div className="bg-[#f8fafc] rounded-lg p-2 mb-3 border border-slate-100/80">
            <p className="text-[7px] uppercase tracking-widest text-muted-foreground font-bold opacity-70">
              Budget bracket
            </p>
            <p className="text-xs font-extrabold text-[#111827]">
              {wedding.budgetMin} - {wedding.budgetMax}
            </p>
          </div>

          {/* Buttons Row */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/wedding/real-weddings/gallery/${wedding.id}`)}
              className="flex-1 py-1.5 rounded-md border border-[#e5e7eb] text-[10px] font-bold text-[#374151] hover:bg-slate-50 transition-all active:scale-95"
            >
              View Photos
            </button>
            <button
              onClick={() => setIsEnquiryOpen(true)}
              className="flex-1 py-1.5 rounded-md wedding-gradient text-background text-[10px] font-bold shadow-sm shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
            >
              Plan Something Similar
            </button>
          </div>
        </div>
      </div>

      <PlanWeddingModal 
        isOpen={isEnquiryOpen} 
        onClose={() => setIsEnquiryOpen(false)} 
        initialLocation={wedding.location} 
      />
    </>
  );
};

export default RealWeddingCardDetailed;
