import { createContext, useContext, useState, useEffect } from "react";

const DRAFT_KEY = "vendor_onboarding_draft";

const defaultState = {
  basicInfo: {
    name: "",
    category: "",
    location: "",
    experience: "",
    phone: "",
    email: "",
  },
  portfolio: [],
  services: [{ name: "", description: "" }],
  pricing: {
    premiumPrice: "",
    description: "",
  },
  kyc: {
    aadhar: null,
    pan: null,
    photo: null,
  },
  status: "draft",
};

const VendorContext = createContext(null);

export const VendorProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Clean up invalid blob URLs that don't survive refresh
        const cleanPortfolio = (parsed.portfolio || []).filter(src => typeof src === 'string' && !src.startsWith('blob:'));
        const cleanKYC = { ...parsed.kyc };
        if (cleanKYC.aadhar?.startsWith('blob:')) cleanKYC.aadhar = null;
        if (cleanKYC.pan?.startsWith('blob:')) cleanKYC.pan = null;
        if (cleanKYC.photo?.startsWith('blob:')) cleanKYC.photo = null;

        return { 
          ...defaultState, 
          ...parsed, 
          portfolio: cleanPortfolio,
          kyc: cleanKYC
        };
      }
    } catch (e) {
      // Ignore parse errors
    }
    return { ...defaultState };
  });

  // Persist on every change
  useEffect(() => {
    if (state.status === "draft") {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
      } catch (error) {
        console.warn("Storage quota exceeded (usually due to large base64 images), saving text fields only to avoid crash.", error);
        try {
          // Fallback: save lightweight draft excluding large binary files (portfolio images & kyc docs)
          const lightState = {
            ...state,
            portfolio: [],
            kyc: { aadhar: null, pan: null, photo: null }
          };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(lightState));
        } catch (innerError) {
          console.error("Failed to persist even lightweight draft", innerError);
        }
      }
    }
  }, [state]);

  const updateBasicInfo = (info) =>
    setState((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, ...info } }));

  const updatePortfolio = (files) =>
    setState((prev) => ({ ...prev, portfolio: files }));

  const addService = () =>
    setState((prev) => ({
      ...prev,
      services: [...prev.services, { name: "", description: "" }],
    }));

  const removeService = (index) =>
    setState((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));

  const updateService = (index, field, value) =>
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));

  const updatePricing = (pricing) =>
    setState((prev) => ({ ...prev, pricing: { ...prev.pricing, ...pricing } }));

  const updateKYC = (data) => 
    setState((prev) => ({ ...prev, kyc: { ...prev.kyc, ...data } }));

  const setStatus = (status) =>
    setState((prev) => ({ ...prev, status }));

  const resetForm = () => {
    localStorage.removeItem(DRAFT_KEY);
    setState({ ...defaultState });
  };

  return (
    <VendorContext.Provider
      value={{
        ...state,
        updateBasicInfo,
        updatePortfolio,
        addService,
        removeService,
        updateService,
        updatePricing,
        updateKYC,
        setStatus,
        resetForm,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};

export const useVendorContext = () => {
  const ctx = useContext(VendorContext);
  if (!ctx) throw new Error("useVendorContext must be used within VendorProvider");
  return ctx;
};

export default VendorContext;
