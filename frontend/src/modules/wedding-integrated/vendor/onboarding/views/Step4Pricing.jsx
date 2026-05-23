import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, IndianRupee } from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import useVendorForm from "../../hooks/useVendorForm";

const Step4Pricing = () => {
  const navigate = useNavigate();
  const { pricing, updatePricing, isStepValid } = useVendorForm();
  const [error, setError] = useState("");

  const handleBasePriceChange = (val) => {
    updatePricing({ basePrice: val });
    const base = Number(val) || 0;
    const premium = Number(pricing.premiumPrice) || 0;
    
    if (pricing.premiumPrice && premium < base) {
      setError("Premium package price cannot be less than the Base package price.");
    } else {
      setError("");
    }
  };

  const handlePremiumPriceChange = (val) => {
    updatePricing({ premiumPrice: val });
    const base = Number(pricing.basePrice) || 0;
    const premium = Number(val) || 0;
    
    if (val && premium < base) {
      setError("Premium package price cannot be less than the Base package price.");
    } else {
      setError("");
    }
  };

  const handleNext = () => {
    if (!isStepValid(4)) {
      setError("Base price is required.");
      return;
    }
    
    const base = Number(pricing.basePrice) || 0;
    const premium = Number(pricing.premiumPrice) || 0;
    
    if (pricing.premiumPrice && premium < base) {
      setError("Premium package price cannot be less than the Base package price.");
      return;
    }
    
    setError("");
    navigate("/wedding/vendor/onboarding/step-4");
  };

  const inputClass =
    "w-full px-4 py-2.5 md:py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  return (
    <div className="min-h-screen bg-background">
      <section className="pt-4 md:pt-12 pb-4 px-4 text-center">
        <h1
          className="text-2xl md:text-4xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Vendor Registration
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Set your pricing
        </p>
      </section>

      <ProgressBar currentStep={3} />

      <div className="max-w-2xl mx-auto px-4 pb-16 md:pb-24">
        <div className="p-5 md:p-8 rounded-2xl bg-card border border-border wedding-shadow animate-wedding-fade-up">
          <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Pricing Details
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Help couples understand your pricing range.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
                Base Package Price (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  min="0"
                  value={pricing.basePrice}
                  onChange={(e) => handleBasePriceChange(e.target.value)}
                  placeholder="e.g. 150000"
                  className={`${inputClass} pl-10`}
                />
              </div>
              {error && error.includes("Base") && <p className="text-xs text-destructive mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
                Premium Package Price (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  min="0"
                  value={pricing.premiumPrice}
                  onChange={(e) => handlePremiumPriceChange(e.target.value)}
                  placeholder="e.g. 350000"
                  className={`${inputClass} pl-10`}
                />
              </div>
              {error && error.includes("Premium") && <p className="text-xs text-destructive mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
                Package Description
              </label>
              <textarea
                rows={4}
                value={pricing.description}
                onChange={(e) => updatePricing({ description: e.target.value })}
                placeholder="Describe what's included in your packages..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => navigate("/wedding/vendor/onboarding/step-2")}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-muted text-muted-foreground transition-all duration-300 hover:bg-primary/10"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium wedding-gradient text-background transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Pricing;
