import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { weddingService } from "../../../services/weddingService";

const TestimonialSlider = () => {
  const [current, setCurrent] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await weddingService.getTestimonials();
        setTestimonials(data || []);
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!loading && testimonials.length === 0) {
    return (
      <div className="py-12 text-center bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-pink-100/50">
        <p className="text-slate-500 italic font-medium">No testimonials yet. Be the first to share your story!</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {testimonials.map((t, i) => (
          <div key={i} className="w-full flex-shrink-0 px-4 py-2 sm:py-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100/50 text-center relative overflow-hidden group">
                {/* Couple Photo */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse blur-xl group-hover:bg-primary/40 transition-colors" />
                  <img
                    src={t.image || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=200"}
                    alt={t.name}
                    className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg relative z-10"
                  />
                </div>

                <p
                  className="text-xl md:text-2xl leading-relaxed text-slate-800 italic relative z-10"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  "{t.text}"
                </p>

                <div className="mt-5 flex flex-col items-center">
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star key={j} className="w-5 h-5 text-[#ffb800] fill-[#ffb800]" />
                    ))}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">{t.name}</h4>
                  <p className="text-sm font-medium text-primary uppercase tracking-[0.2em] mt-1">{t.location}</p>
                </div>

                {/* Decorative background circle */}
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-2 sm:mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-primary w-8" : "bg-primary/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialSlider;
