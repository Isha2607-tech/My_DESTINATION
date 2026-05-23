import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Send,
  User,
  Camera,
  Briefcase,
  IndianRupee,
  Edit3,
  Loader2,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import ProgressBar from "../components/ProgressBar";
import useVendorForm from "../../hooks/useVendorForm";
import { useAuth } from "../../context/AuthContext";

const ReviewSubmit = () => {
  const navigate = useNavigate();
  const { basicInfo, portfolio, services, pricing, kyc, submitForm, resetForm } = useVendorForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await submitForm();
      if (res.success) {
        toast.success("Application submitted successfully! 🎉");
        resetForm(); // Clear the draft
        navigate("/wedding/vendor/pending-approval");
      } else {
        toast.error(res.error || res.message || "Failed to submit application");
        setLoading(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred during submission. Please try again.");
      setLoading(false);
    }
  };

  const formatPrice = (val) => {
    if (!val) return "—";
    return `₹${Number(val).toLocaleString("en-IN")}`;
  };

  const SectionCard = ({ icon: Icon, title, editPath, children }) => (
    <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            {title}
          </h3>
        </div>
        <Link
          to={editPath}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Edit3 className="w-3 h-3" /> Edit
        </Link>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <section className="pt-4 md:pt-12 pb-4 px-4 text-center">
        <h1
          className="text-2xl md:text-4xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Review & Submit
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Verify your details before submitting
        </p>
      </section>

      <ProgressBar currentStep={5} totalSteps={5} />

      <div className="max-w-2xl mx-auto px-4 pb-16 md:pb-24">
        <div className="p-5 md:p-8 rounded-2xl bg-card border border-border wedding-shadow animate-wedding-fade-up space-y-5">
          {/* Basic Info */}
          <SectionCard icon={User} title="Basic Info" editPath="/wedding/vendor/onboarding/step-1">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Business Name</p>
                <p className="font-semibold">{basicInfo.name || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Category</p>
                <p className="font-semibold">{basicInfo.category || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Location</p>
                <p className="font-semibold">{basicInfo.location || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Experience</p>
                <p className="font-semibold">{basicInfo.experience ? `${basicInfo.experience} years` : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Phone</p>
                <p className="font-semibold">{basicInfo.phone || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="font-semibold">{basicInfo.email || "—"}</p>
              </div>
            </div>
          </SectionCard>


          {/* Services */}
          <SectionCard icon={Briefcase} title="Services" editPath="/wedding/vendor/onboarding/step-2">
            <div className="space-y-2">
              {services.filter(s => s.name.trim()).map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-background border border-border">
                  <p className="text-sm font-semibold">{s.name}</p>
                  {s.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  )}
                </div>
              ))}
              {services.filter(s => s.name.trim()).length === 0 && (
                <p className="text-sm text-muted-foreground italic">No services added</p>
              )}
            </div>
          </SectionCard>

          {/* Pricing */}
          <SectionCard icon={IndianRupee} title="Pricing" editPath="/wedding/vendor/onboarding/step-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Base Package</p>
                <p className="font-bold text-lg text-primary">{formatPrice(pricing.basePrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Premium Package</p>
                <p className="font-bold text-lg">{formatPrice(pricing.premiumPrice)}</p>
              </div>
            </div>
            {pricing.description && (
              <p className="text-sm text-muted-foreground mt-2">{pricing.description}</p>
            )}
          </SectionCard>

          {/* KYC */}
          <SectionCard icon={ShieldCheck} title="KYC Verification" editPath="/wedding/vendor/onboarding/step-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1.5">Aadhar Card</p>
                {kyc.aadhar ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                      <FileCheck className="w-4 h-4" /> Uploaded
                    </div>
                    {kyc.aadhar.startsWith("data:image/") ? (
                      <div className="w-20 h-14 rounded-xl overflow-hidden border border-[#F3E9E2] shadow-sm bg-muted">
                        <img src={kyc.aadhar} alt="Aadhar Card" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-14 rounded-xl bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        PDF Document
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-destructive text-xs font-bold">Not Uploaded</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1.5">Vendor Photo</p>
                {kyc.photo ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-[#F3E9E2] shadow-sm bg-muted">
                    <img src={kyc.photo} alt="KYC Vendor" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <p className="text-destructive text-xs font-bold">Not Uploaded</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1.5">PAN Card</p>
                {kyc.pan ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                      <FileCheck className="w-4 h-4" /> Uploaded
                    </div>
                    {kyc.pan.startsWith("data:image/") ? (
                      <div className="w-20 h-14 rounded-xl overflow-hidden border border-[#F3E9E2] shadow-sm bg-muted">
                        <img src={kyc.pan} alt="PAN Card" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-14 rounded-xl bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        PDF Document
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs font-medium italic">Optional / Not Uploaded</p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Submit */}
          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <button
              onClick={() => navigate("/wedding/vendor/onboarding/step-4")}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-muted text-muted-foreground transition-all duration-300 hover:bg-primary/10"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium wedding-gradient text-background transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Application <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmit;
