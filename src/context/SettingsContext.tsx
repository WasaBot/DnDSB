import React, { createContext, useContext, useState } from "react";
import type { Character, SettingsContextType, UnitType } from "../utils/types/types";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unit, setUnit] = useState<UnitType>("ft");
  const [character, setCharacter] = useState<Character>({
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

  React.useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const importStr = params.get("import");
      if (importStr) {
        try {
          const decoded = decodeURIComponent(escape(atob(importStr.trim())));
          const data = JSON.parse(decoded);
          if (data.character) setCharacter(data.character);
        } catch {
          // eslint-disable-next-line no-console
          console.error("Failed to import character from URL.");
        }
      }
    }, []);

  return (
    <SettingsContext.Provider value={{ unit, setUnit, character, setCharacter }}>
      <div>
        {unit}, 
        {character.name}, 
        {character.class.name}, 
        {character.class.spellcastingAbility}, 
        {character.level}, 
        {character.spellcasting?.spellIndices}, 
        {character.spellcasting?.spellSlots}
      </div>
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
}