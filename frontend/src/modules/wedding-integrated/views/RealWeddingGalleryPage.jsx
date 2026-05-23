import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Heart, Plus } from "lucide-react";
import { weddingService } from "../../../services/weddingService";
import ScrollReveal from "../components/ScrollReveal";
import PlanWeddingModal from "../components/PlanWeddingModal";

const RealWeddingGalleryPage = () => {
  const { weddingId } = useParams();
  const navigate = useNavigate();
  const [isEnquiryOpen, setIsEnquiryOpen] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);
  const [wedding, setWedding] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchWedding = async () => {
      try {
        setLoading(true);
        const data = await weddingService.getRealWeddings();
        const found = data.find((w) => (w.id === weddingId || w._id === weddingId));
        setWedding(found);
      } catch (error) {
        console.error("Failed to fetch wedding details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWedding();
  }, [weddingId]);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/wedding');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${wedding?.coupleName} - Destination Wedding`,
          text: `Check out ${wedding?.coupleName}'s beautiful wedding gallery at ${wedding?.location}!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Gallery link copied to clipboard!");
      }
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Wedding not found</h2>
          <button onClick={() => navigate(-1)} className="text-primary font-bold underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Premium Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <div className="p-2 rounded-full group-hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              {wedding.coupleName}
            </h1>
            <p className="text-[10px] md:text-xs text-primary uppercase tracking-[0.2em] font-black">
              {wedding.locationName || wedding.location || wedding.destination?.name || "Destination"} Wedding
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2.5 rounded-full hover:bg-slate-50 transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
            >
              <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2.5 rounded-full hover:bg-slate-50 transition-colors text-slate-400 hover:text-blue-500"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-4 pb-12">
        <ScrollReveal>
          <div className="text-center mb-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
              A Love Story Captured
            </div>
            <h2 className="text-2xl md:text-5xl font-bold leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Memories from the <br className="hidden sm:block" /> {wedding.locationName || wedding.location || wedding.destination?.name || "Destination"} Celebration
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] md:text-sm text-slate-500 font-medium italic">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span>{wedding.guests} Guests Witnessed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span>{wedding.budgetMin} - {wedding.budgetMax} Budget</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Exact Mosaic Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[160px] md:auto-rows-[240px]">
          {wedding.photos.map((photo, i) => {
            // Sequence based on the reference image:
            // 0: Tall (col 1, row 1-2)
            // 1: Small (col 2, row 1)
            // 2: Small (col 3, row 1)
            // 3: Wide (col 2-3, row 2)
            // 4: Small (col 1, row 3)
            // 5: Small (col 2, row 3)
            // 6: Wide (col 3, row 3 - No, wide should be 2 cols)
            
            let spanClass = "col-span-1 row-span-1";
            const index = i % 7;
            
            if (index === 0) spanClass = "col-span-1 row-span-2"; // Tall
            else if (index === 3) spanClass = "col-span-2 row-span-1"; // Wide
            else if (index === 6) spanClass = "col-span-2 row-span-1"; // Wide
            else spanClass = "col-span-1 row-span-1"; // Small
            
            return (
              <ScrollReveal key={i} delay={i * 50}>
                <div className={`${spanClass} rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group relative cursor-zoom-in h-full`}>
                  <img
                    src={photo}
                    alt={`Wedding Moment ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <ScrollReveal>
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-primary/5 border border-slate-100 relative overflow-hidden">
              <div className="relative z-10 max-w-lg mx-auto">
                <h3 className="text-xl md:text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Inspired by this wedding?
                </h3>
                <p className="text-xs md:text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                  Let us help you plan your dream destination wedding. We'll handle everything from venues to vendors while you focus on making memories.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button 
                    onClick={() => setIsEnquiryOpen(true)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#ff7676] text-white rounded-full text-xs md:text-sm font-bold shadow-xl shadow-red-200 hover:bg-red-500 transition-all flex items-center justify-center gap-2 group active:scale-95"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Plan Your Wedding</span>
                  </button>
                  <button 
                    onClick={() => navigate('/wedding/planners')}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-slate-200 text-xs md:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Contact Planner
                  </button>
                </div>
              </div>
              
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32" />
            </div>
          </ScrollReveal>
        </div>
      </main>

      {/* Footer Navigation Back to Home */}
      <footer className="py-20 border-t border-slate-100 bg-white text-center">
        <ScrollReveal>
          <button 
            onClick={() => navigate('/wedding')}
            className="text-slate-400 hover:text-primary transition-colors text-sm font-bold uppercase tracking-[0.5em]"
          >
            Weddings Home
          </button>
        </ScrollReveal>
      </footer>

      <PlanWeddingModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} />
    </div>
  );
};

export default RealWeddingGalleryPage;
