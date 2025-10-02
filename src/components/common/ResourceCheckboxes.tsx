import React, { useState, useEffect } from "react";
import { useResources } from "../../context/ResourcesContext";

interface ResourceCheckboxesProps {
  resourceName: string;
  maxAmount: number;
  characterId: string;
  resetsOn?: "short" | "short-long" | "long";
  className?: string;
}

const ResourceCheckboxes: React.FC<ResourceCheckboxesProps> = ({
  resourceName,
  maxAmount,
  characterId,
  resetsOn = "long",
  className = "",
}) => {
  const { resetTrigger } = useResources();
  const storageKey = `resource_${resourceName.toLowerCase().replace(/\s+/g, "_")}_${characterId}`;
  
  const [usedResources, setUsedResources] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : Array(maxAmount).fill(false);
    } catch {
      return Array(maxAmount).fill(false);
    }
  });

  // Update localStorage when usedResources changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(usedResources));
    } catch {}
  }, [usedResources, storageKey]);

  // Update array length when maxAmount changes
  useEffect(() => {
    setUsedResources(prev => {
      const newArray = Array(maxAmount).fill(false);
      // Preserve existing state up to the new length
      for (let i = 0; i < Math.min(prev.length, maxAmount); i++) {
        newArray[i] = prev[i];
      }
      return newArray;
    });
  }, [maxAmount]);

  // Reset resources when reset is triggered
  useEffect(() => {
    if (resetTrigger > 0) {
      setUsedResources(Array(maxAmount).fill(false));
    }
  }, [resetTrigger, maxAmount]);

  const handleToggle = (index: number) => {
    setUsedResources(prev => {
      const newArray = [...prev];
      newArray[index] = !newArray[index];
      return newArray;
    });
  };

  const usedCount = usedResources.filter(Boolean).length;

  return (
    <div className={`resource-checkboxes ${className}`}>
      <div className="resource-header">
        <h4>{resourceName}</h4>
        <span className="resource-counter">
          {usedCount}/{maxAmount} used
        </span>
        {resetsOn && (
          <span className="resource-reset-info">
            (Resets on {resetsOn === "short-long" ? "short or long" : resetsOn} rest)
          </span>
        )}
      </div>
      
      <div className="resource-checkboxes-container">
        {Array.from({ length: maxAmount }, (_, index) => (
          <label key={index} className="resource-checkbox">
            <input
              type="checkbox"
              checked={usedResources[index] || false}
              onChange={() => handleToggle(index)}
            />
            <span className="checkbox-number">{index + 1}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ResourceCheckboxes;