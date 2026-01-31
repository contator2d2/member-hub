import React, { createContext, useContext, useState, ReactNode } from "react";

interface BrandingConfig {
  logoUrl: string | null;
  brandName: string;
  primaryColor: string;
}

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (config: Partial<BrandingConfig>) => void;
}

const defaultBranding: BrandingConfig = {
  logoUrl: null,
  brandName: "Sua Marca",
  primaryColor: "0 85% 50%",
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);

  const updateBranding = (config: Partial<BrandingConfig>) => {
    setBranding((prev) => ({ ...prev, ...config }));
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
};
