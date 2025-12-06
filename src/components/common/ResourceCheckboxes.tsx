import React, { useState, useEffect } from "react";
import { useResources } from "../../context/ResourcesContext";

interface ResourceCheckboxesProps {
    resourceName: string;
    maxAmount: number;
    characterId: string;
    resetsOn?: "short" | "short-long" | "long";
    className?: string;
    children?: React.ReactNode;
    toggleChildren?: boolean;
}

const ResourceCheckboxes: React.FC<ResourceCheckboxesProps> = ({
    resourceName,
    maxAmount,
    characterId,
    resetsOn = "long",
    className = "",
    children,
    toggleChildren,
}) => {
    const { resetTrigger, restType } = useResources();
    const storageKey = `resource_${resourceName
        .toLowerCase()
        .replace(/\s+/g, "_")}_${characterId}`;

    const [usedResources, setUsedResources] = useState<boolean[]>(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : Array(maxAmount).fill(false);
        } catch {
            return Array(maxAmount).fill(false);
        }
    });
    const [childrenVisible,setChildrenVisible] = React.useState<boolean>(false);

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(usedResources));
        } catch {}
    }, [usedResources, storageKey]);

    useEffect(() => {
        setUsedResources((prev) => {
            const newArray = Array(maxAmount).fill(false);
            for (let i = 0; i < Math.min(prev.length, maxAmount); i++) {
                newArray[i] = prev[i];
            }
            return newArray;
        });
    }, [maxAmount]);

    useEffect(() => {
        if (resetTrigger > 0 && restType) {
            let shouldReset = false;
            if (resetsOn === "short" && restType === "short") {
                shouldReset = true;
            } else if (resetsOn === "long" && restType === "long") {
                shouldReset = true;
            } else if (resetsOn === "short-long" && (restType === "short" || restType === "long")) {
                shouldReset = true;
            }            
            if (shouldReset) {
                setUsedResources(Array(maxAmount).fill(false));
            }
        }
    }, [resetTrigger, restType, maxAmount, resetsOn]);

    const handleToggle = (index: number) => {
        setUsedResources((prev) => {
            const newArray = [...prev];
            newArray[index] = !newArray[index];
            if (toggleChildren) setChildrenVisible(!childrenVisible);
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
            </div>

            <div className="resource-checkboxes-container">
                {maxAmount <= 15 ? (
                    Array.from({ length: maxAmount }, (_, index) => (
                        <label key={index} className="resource-checkbox">
                            <input
                                key={index}
                                type="checkbox"
                                checked={usedResources[index] || false}
                                onChange={() => handleToggle(index)}
                            />
                        </label>
                    ))
                ) : (
                    <label key="resource-range">
                        <input
                            type="range"
                            name={resourceName + "-range"}
                            min={0}
                            max={maxAmount}
                            value={usedCount}
                            style={{ width: "100%" }}
                            onChange={(event) => {
                                const newUsedCount = parseInt(event.target.value);
                                setUsedResources(() => {
                                    const newArray = Array(maxAmount).fill(false);
                                    for (let i = 0; i < newUsedCount; i++) {
                                        newArray[i] = true;
                                    }
                                    return newArray;
                                });
                            }}
                        />
                    </label>
                )}
            </div>
            {childrenVisible && <>{children}</>}
        </div>
    );
};

export default ResourceCheckboxes;
