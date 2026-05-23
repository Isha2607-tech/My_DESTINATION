import { Check } from "lucide-react";

const stepLabels = ["Basic Info", "Services", "Pricing", "KYC", "Review"];

const ProgressBar = ({ currentStep = 1, totalSteps = 5 }) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-8 md:mb-12">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div key={s} className={`flex items-center ${s < totalSteps ? "flex-1" : ""}`}>
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex shrink-0 items-center justify-center text-xs md:text-sm font-semibold transition-all duration-500 shadow-sm ${
                currentStep >= s
                  ? "wedding-gradient text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > s ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : s}
            </div>
            {s < totalSteps && (
              <div className="flex-1 h-1 mx-0 rounded-full overflow-hidden bg-muted">
                <div
                  className="h-full wedding-gradient transition-all duration-700"
                  style={{ width: currentStep > s ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        {stepLabels.map((label) => (
          <span key={label} className="text-[8px] md:text-[10px] text-muted-foreground font-medium text-center" style={{ width: `${100 / totalSteps}%` }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
