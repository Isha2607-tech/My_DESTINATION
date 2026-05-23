import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import ServiceForm from "../components/ServiceForm";
import useVendorForm from "../../hooks/useVendorForm";

const Step3Services = () => {
  const navigate = useNavigate();
  const { services, addService, removeService, updateService, isStepValid } = useVendorForm();
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!isStepValid(3)) {
      setError("Please add at least one service with a name.");
      return;
    }
    setError("");
    navigate("/wedding/vendor/onboarding/step-3");
  };

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
          What services do you offer?
        </p>
      </section>

      <ProgressBar currentStep={2} />

      <div className="max-w-2xl mx-auto px-4 pb-16 md:pb-24">
        <div className="p-5 md:p-8 rounded-2xl bg-card border border-border wedding-shadow animate-wedding-fade-up">
          <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Services
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Add the services you provide. At least one service is required.
          </p>

          <ServiceForm
            services={services}
            onAdd={addService}
            onRemove={removeService}
            onUpdate={updateService}
          />

          {error && (
            <p className="text-xs text-destructive mt-3 text-center">{error}</p>
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={() => navigate("/wedding/vendor/onboarding/step-1")}
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

export default Step3Services;
