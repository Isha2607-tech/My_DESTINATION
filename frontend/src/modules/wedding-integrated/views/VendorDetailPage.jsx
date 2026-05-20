import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star, MapPin, Heart, Share2, Phone, MessageSquare, Mail,
  ChevronRight, CheckCircle, Image as ImageIcon,
  Calendar, ChevronLeft, X, Award, Play, Loader2, Inbox, Flag, User
} from "lucide-react";
import { 
  weddingEnquiryService, 
  weddingVendorService, 
  weddingVenueService,
  weddingReviewService 
} from "../../../services/apiService";
import { weddingService } from "../../../services/weddingService";
import toast from "react-hot-toast";

/* --- Lightbox --- */
const Lightbox = ({ images, startIdx, onClose }) => {
  const [idx, setIdx] = useState(startIdx);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10" onClick={onClose}>
        <X className="w-5 h-5" />
      </button>
      <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10" onClick={(e) => { e.stopPropagation(); prev(); }}>
        <ChevronLeft className="w-5 h-5" />
      </button>
      <img src={images[idx]} alt="" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
      <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10" onClick={(e) => { e.stopPropagation(); next(); }}>
        <ChevronRight className="w-5 h-5" />
      </button>
      <div className="absolute bottom-4 text-white/60 text-sm">{idx + 1} / {images.length}</div>
    </div>
  );
};

/* --- Star Row --- */
const StarRow = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-[#f04e5e] text-[#f04e5e]" : "text-slate-200"}`} />
    ))}
  </div>
);

/* --- Vendor Detail Page --- */
const VendorDetailPage = () => {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("Projects");
  const [projectsSubTab, setProjectsSubTab] = useState("Portfolio");
  const [isSticky, setIsSticky] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [shortlisted, setShortlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", date: "", message: "" });
  const heroRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let data = null;
        try {
          data = await weddingVendorService.getPublicVendorDetail(vendorId);
        } catch (err) {
          data = await weddingVenueService.getPublicVenueDetail(vendorId);
        }
        if (data) {
          setVendor(data);
          const revs = await weddingReviewService.getPublicReviews(vendorId);
          setReviews(revs);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [vendorId]);

  useEffect(() => {
    if (vendor) {
      const type = (vendor.isVenue || vendor.capacity) ? 'venue' : 'vendor';
      weddingService.incrementView(type, vendorId || vendor._id)
        .catch(err => console.error("View increment failed", err));
    }
  }, [vendor]);

  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        setIsSticky(window.scrollY > heroRef.current.offsetTop + heroRef.current.offsetHeight - 60);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-slate-500 font-medium">Loading...</p>
    </div>
  );

  if (!vendor) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Inbox className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Not Found</h2>
        <Link to="/wedding/vendors" className="text-primary hover:underline">Go Back</Link>
      </div>
    </div>
  );

  const galleryImages = vendor.images?.length > 0 ? vendor.images : [vendor.image || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200"];
  const portfolioImages = vendor.portfolio?.length > 0 ? vendor.portfolio : galleryImages;

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await weddingEnquiryService.createEnquiry({
        ...formData,
        targetType: vendor.isVenue || vendor.capacity ? "Venue" : "Vendor",
        targetId: vendor._id
      });
      toast.success("Enquiry sent!");
      setFormData({ name: "", phone: "", email: "", date: "", message: "" });
    } catch (err) {
      toast.error(err.message || "Failed to send");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFF5F6] min-h-screen">
      {lightbox && <Lightbox images={lightbox.images} startIdx={lightbox.idx} onClose={() => setLightbox(null)} />}

      {/* Hero */}
      <div ref={heroRef} className="relative bg-black h-[300px] md:h-[460px] overflow-hidden flex">
        <div className="flex-[2] relative cursor-zoom-in" onClick={() => setLightbox({ images: galleryImages, idx: 0 })}>
          <img src={galleryImages[0]} alt="" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-8 left-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{vendor.name}</h1>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {vendor.location || vendor.destination?.name}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {vendor.rating || '5.0'} ({reviews.length} reviews)</span>
            </div>
          </div>
        </div>
        {galleryImages.length > 1 && (
          <div className="hidden md:flex flex-col flex-1 gap-1">
            {galleryImages.slice(1, 3).map((img, i) => (
              <div key={i} className="flex-1 relative cursor-zoom-in overflow-hidden" onClick={() => setLightbox({ images: galleryImages, idx: i + 1 })}>
                <img src={img} alt="" className="w-full h-full object-cover" />
                {i === 1 && galleryImages.length > 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold">
                    +{galleryImages.length - 3} Photos
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={`bg-white border-b border-slate-200 z-20 ${isSticky ? "sticky top-0 shadow-md" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-8">
          {["Projects", "About", "Reviews"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === t ? "border-primary text-primary" : "border-transparent text-slate-500"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
            {activeTab === "Projects" && (
              <div>
                <div className="flex gap-4 border-b border-slate-100 mb-6">
                  {["Portfolio", "Albums"].map(s => (
                    <button key={s} onClick={() => setProjectsSubTab(s)} className={`pb-2 text-[11px] font-bold uppercase tracking-widest ${projectsSubTab === s ? "text-primary border-b-2 border-primary" : "text-slate-400"}`}>{s}</button>
                  ))}
                </div>
                {projectsSubTab === "Portfolio" ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {portfolioImages.map((img, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-zoom-in bg-slate-50" onClick={() => setLightbox({ images: portfolioImages, idx: i })}>
                        <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                ) : <div className="py-12 text-center text-slate-400 italic">No albums yet.</div>}
              </div>
            )}

            {activeTab === "About" && (
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold mb-4">About {vendor.name}</h3>
                <p className="text-slate-600 leading-relaxed">{vendor.about || vendor.description || "Leading professional in the wedding industry."}</p>
                {vendor.services?.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-bold mb-4">Services Offered</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {vendor.services.map(s => <div key={s} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500" /> {s}</div>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Reviews" && (
              <ReviewsTab vendor={vendor} reviews={reviews} onUpdate={() => {}} />
            )}
          </div>
        </div>

        <aside className="w-full lg:w-[350px] space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="mb-6">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Starting Price</span>
              <div className="text-3xl font-black text-primary">
                {typeof vendor.price === 'object' 
                  ? (vendor.price.base ? `₹${vendor.price.base.toLocaleString()}` : 'Contact')
                  : (vendor.price || (vendor.startingPrice ? `₹${(vendor.startingPrice / 100000).toFixed(1)}L` : 'Contact'))}
              </div>
            </div>
            <form onSubmit={handleEnquirySubmit} className="space-y-4">
              <input type="text" placeholder="Your Name" required className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-1 focus:ring-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="email" placeholder="Email Address" required className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-1 focus:ring-primary" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="text" placeholder="Phone Number" required className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-1 focus:ring-primary" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </aside>
      </main>
    </div>
  );
};

/* --- Reviews Tab Component --- */
const ReviewsTab = ({ vendor, reviews }) => {
  const [starRating, setStarRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReviewSubmit = async () => {
    if (starRating === 0 || !comment.trim() || !reviewName.trim() || !reviewEmail.trim()) {
      return toast.error("Rating, Name, Email, and Comment are required");
    }
    try {
      setSubmitting(true);
      await weddingReviewService.createReview({
        targetId: vendor._id,
        targetType: vendor.capacity ? "Venue" : "Vendor",
        rating: starRating,
        comment,
        name: reviewName,
        email: reviewEmail
      });
      toast.success("Review submitted!");
      setStarRating(0); setComment(""); setReviewName(""); setReviewEmail("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 rounded-2xl p-6">
        <div className="text-center">
          <div className="text-5xl font-black text-slate-800">{vendor.rating || '5.0'}</div>
          <StarRow rating={vendor.rating || 5} />
          <div className="text-xs text-slate-400 mt-2">{reviews.length} reviews</div>
        </div>
        <div className="flex-1 w-full space-y-2">
          {[5, 4, 3, 2, 1].map(s => {
            const count = reviews.filter(r => r.rating === s).length;
            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={s} className="flex items-center gap-3 text-xs">
                <span className="w-4 font-bold">{s}</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-12 text-slate-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map(r => (
          <div key={r._id} className="border-b border-slate-100 pb-6">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><User className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <div className="text-sm font-bold">{r.name || r.userName || "Customer"}</div>
                  <div className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">★ {r.rating}</div>
            </div>
            <p className="text-sm text-slate-600 italic">"{r.comment}"</p>
            {r.vendorReply && (
              <div className="mt-4 ml-8 p-4 bg-slate-50 rounded-xl border-l-4 border-primary">
                <div className="text-[10px] font-bold text-primary uppercase mb-1">Reply from Vendor</div>
                <p className="text-xs text-slate-500 italic">{r.vendorReply}</p>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && <p className="text-slate-400 italic">No reviews yet. Be the first to review!</p>}
      </div>

      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <h4 className="font-bold mb-4">Write a Review</h4>
        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map(s => (
            <button key={s} onMouseEnter={() => setHoverStar(s)} onMouseLeave={() => setHoverStar(0)} onClick={() => setStarRating(s)}>
              <Star className={`w-6 h-6 ${(hoverStar || starRating) >= s ? "fill-primary text-primary" : "text-slate-300"}`} />
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Your Name" value={reviewName} onChange={e => setReviewName(e.target.value)} className="w-full p-3 bg-white rounded-xl text-sm border-none focus:ring-1 focus:ring-primary" />
          <input type="email" placeholder="Your Email" value={reviewEmail} onChange={e => setReviewEmail(e.target.value)} className="w-full p-3 bg-white rounded-xl text-sm border-none focus:ring-1 focus:ring-primary" />
        </div>
        <textarea placeholder="Your experience..." className="w-full p-4 bg-white rounded-xl text-sm border-none focus:ring-1 focus:ring-primary min-h-[100px] mb-4" value={comment} onChange={e => setComment(e.target.value)} />
        <button onClick={handleReviewSubmit} disabled={submitting} className="px-8 py-3 bg-primary text-white font-bold rounded-xl text-sm shadow-md disabled:opacity-50">
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
};

export default VendorDetailPage;
