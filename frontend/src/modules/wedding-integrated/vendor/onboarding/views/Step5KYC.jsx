import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Upload, FileCheck, AlertCircle, X } from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import useVendorForm from "../../hooks/useVendorForm";
import { fileToBase64 } from "../../../../../utils/fileUtils";

const Step5KYC = () => {
  const navigate = useNavigate();
  const { kyc, updateKYC } = useVendorForm();
  const [errors, setErrors] = useState({});

  const handleFileChange = async (field, e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        updateKYC({ [field]: base64 });
        setErrors(prev => ({ ...prev, [field]: null }));
      } catch (error) {
        console.error("Failed to convert KYC file to base64", error);
      }
    }
  };

  const handleDelete = (field, e) => {
    e.stopPropagation();
    updateKYC({ [field]: null });
  };

  const handleNext = () => {
    const newErrors = {};
    if (!kyc.aadhar) newErrors.aadhar = "Aadhar Card is required for verification";
    if (!kyc.photo) newErrors.photo = "Vendor photo is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    navigate("/wedding/vendor/onboarding/step-5");
  };

  const uploadBoxClass = (field) => 
    `relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer ${
      kyc[field] ? "bg-emerald-50/30 border-emerald-200" : "bg-muted/30 border-border hover:bg-muted/50 hover:border-primary/50"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <section className="pt-4 md:pt-12 pb-4 px-4 text-center">
        <h1 className="text-2xl md:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          KYC Verification
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Upload documents to verify your business identity
        </p>
      </section>

      <ProgressBar currentStep={4} />

      <div className="max-w-2xl mx-auto px-4 pb-16 md:pb-24">
        <div className="p-5 md:p-8 rounded-2xl bg-card border border-border wedding-shadow animate-wedding-fade-up">
          <div className="flex items-center gap-2 mb-6 bg-primary/5 p-4 rounded-xl border border-primary/10">
            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
              Your documents are secure. A verified badge on your profile increases lead conversion by up to <span className="text-primary font-bold">35%</span>.
            </p>
          </div>

          <div className="space-y-6">
            {/* Aadhar Card */}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">
                Aadhar Card *
              </label>
              <div className={uploadBoxClass('aadhar')} onClick={() => document.getElementById('aadhar-input').click()}>
                <input 
                  id="aadhar-input"
                  type="file" 
                  accept="image/*,.pdf" 
                  className="hidden" 
                  onChange={(e) => handleFileChange('aadhar', e)} 
                />
                {kyc.aadhar ? (
                  <div className="flex flex-col items-center relative z-10">
                    {kyc.aadhar.startsWith("data:image/") ? (
                      <img src={kyc.aadhar} alt="Aadhar Card" className="max-h-24 rounded-lg object-contain border border-[#F3E9E2] shadow-sm mb-2" />
                    ) : (
                      <FileCheck className="w-10 h-10 text-emerald-500 mb-3" />
                    )}
                    <p className="text-xs font-bold text-emerald-600">Aadhar Uploaded</p>
                    <button 
                      onClick={(e) => handleDelete('aadhar', e)}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md border border-border hover:bg-red-50 hover:text-red-500 transition-all z-20"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-xs font-bold text-[#4A3730]">Click to upload Aadhar</p>
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">Images (JPG/PNG) or PDF allowed</p>
                  </>
                )}
              </div>
              {errors.aadhar && <p className="text-xs text-destructive mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3.5 h-3.5" /> {errors.aadhar}</p>}
            </div>

            {/* Vendor Photo */}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">
                Vendor / Business Photo *
              </label>
              <div className={uploadBoxClass('photo')} onClick={() => document.getElementById('photo-input').click()}>
                <input 
                  id="photo-input"
                  type="file" 
                  accept="image/*,.pdf" 
                  className="hidden" 
                  onChange={(e) => handleFileChange('photo', e)} 
                />
                {kyc.photo ? (
                  <div className="relative">
                    <img src={kyc.photo} alt="Vendor" className="w-24 h-24 rounded-full object-cover border-2 border-emerald-200" />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full"><FileCheck className="w-3 h-3" /></div>
                    <button 
                      onClick={(e) => handleDelete('photo', e)}
                      className="absolute -top-2 -right-12 p-2 bg-white rounded-full shadow-md border border-border hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-xs font-bold text-[#4A3730]">Click to upload Professional Photo</p>
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">Images or PDF allowed</p>
                  </>
                )}
              </div>
              {errors.photo && <p className="text-xs text-destructive mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3.5 h-3.5" /> {errors.photo}</p>}
            </div>

            {/* PAN Card */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-0.5">
                   PAN Card
                </label>
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Optional</span>
              </div>
              <div className={uploadBoxClass('pan')} onClick={() => document.getElementById('pan-input').click()}>
                <input 
                  id="pan-input"
                  type="file" 
                  accept="image/*,.pdf" 
                  className="hidden" 
                  onChange={(e) => handleFileChange('pan', e)} 
                />
                {kyc.pan ? (
                  <div className="flex flex-col items-center relative z-10">
                    {kyc.pan.startsWith("data:image/") ? (
                      <img src={kyc.pan} alt="PAN Card" className="max-h-24 rounded-lg object-contain border border-[#F3E9E2] shadow-sm mb-2" />
                    ) : (
                      <FileCheck className="w-10 h-10 text-emerald-500 mb-3" />
                    )}
                    <p className="text-xs font-bold text-emerald-600">PAN Card Uploaded</p>
                    <button 
                      onClick={(e) => handleDelete('pan', e)}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md border border-border hover:bg-red-50 hover:text-red-500 transition-all z-20"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-xs font-bold text-[#4A3730]">Click to upload PAN Card</p>
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">Images or PDF allowed</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => navigate("/wedding/vendor/onboarding/step-3")}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium wedding-gradient text-background transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5KYC;
