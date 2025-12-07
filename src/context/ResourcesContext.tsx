import React, { createContext, useContext, useState } from "react";

interface ResourcesContextType {
  resetTrigger: number;
  triggerReset: (restType: "short" | "long") => void;
  restType?: "short" | "long";
}

const ResourcesContext = createContext<ResourcesContextType | undefined>(undefined);

export const ResourcesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resetTrigger, setResetTrigger] = useState(0);
  const [restType, setRestType] = useState<"short" | "long" | undefined>(undefined);

  const triggerReset = (type: "short" | "long") => {
    setRestType(type);
    setResetTrigger(prev => prev + 1);
  };

  return (
    <ResourcesContext.Provider value={{ resetTrigger, triggerReset, restType }}>
      {children}
    </ResourcesContext.Provider>
  );
};

export function useResources() {
  const context = useContext(ResourcesContext);
  if (!context) throw new Error("useResources must be used within a ResourcesProvider");
  return context;
}