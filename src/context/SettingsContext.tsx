import React, { createContext, useContext, useState } from "react";
import type { Character, SettingsContextType, UnitType } from "../utils/types/types";
import { generateCharacterId } from "../utils/functions";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unit, setUnit] = useState<UnitType>(() => {
    try {
      const saved = localStorage.getItem('dndsb_unit');
      return saved ? JSON.parse(saved) : "ft";
    } catch {
      return "ft";
    }
  });
  
  const [character, setCharacter] = useState<Character>({
    id: generateCharacterId("John", "Fighter"),
    name: "John",
    class: {
      name: "Fighter"
    },
    attributes: {
      Strength: 10,
      Dexterity: 10,
      Constitution: 10,
      Intelligence: 6,
      Wisdom: 10,
      Charisma: 10
    },
    level: 1,
  });

  // Save unit to localStorage when it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('dndsb_unit', JSON.stringify(unit));
    } catch {
      // Ignore localStorage errors
    }
  }, [unit]);



  // Auto-generate character ID when name or class changes (but avoid infinite loops)
  React.useEffect(() => {
    const newId = generateCharacterId(character.name, character.class.name, character.class.subclass?.id);
    if (character.id !== newId) {
      setCharacter(prev => {
        // Only update if the ID actually needs to change to avoid loops
        if (prev.id !== newId) {
          return {
            ...prev,
            id: newId
          };
        }
        return prev;
      });
    }
  }, [character.name, character.class.name, character.class.subclass?.id, character.id]);

  React.useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const importStr = params.get("import");
      if (importStr) {
        try {
          const decoded = decodeURIComponent(atob(importStr.trim()));
          const data = JSON.parse(decoded);
          if (data.character) setCharacter(data.character);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Failed to import character from URL.", error);
        }
      }
    }, []);

  return (
    <SettingsContext.Provider value={{ unit, setUnit, character, setCharacter }}>
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
}