import React, { createContext, useContext, useState } from "react";

export type UnitType = "m" | "ft";

export type CharacterClass =
  | "Barbarian"
  | "Bard"
  | "Cleric"
  | "Druid"
  | "Fighter"
  | "Monk"
  | "Paladin"
  | "Ranger"
  | "Rogue"
  | "Sorcerer"
  | "Warlock"
  | "Wizard";

export interface Character {
  name: string;
  class: CharacterClass;
  level: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  spells: string[]; // <-- Add this line
}

type SettingsContextType = {
  unit: UnitType;
  setUnit: (unit: UnitType) => void;
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
};

const defaultCharacter: Character = {
  name: "Arannis",
  class: "Wizard",
  level: 1,
  strength: 8,
  dexterity: 14,
  constitution: 12,
  intelligence: 16,
  wisdom: 10,
  charisma: 13,
  spells: [], // <-- Add this line
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unit, setUnit] = useState<UnitType>("ft");
  const [character, setCharacter] = useState<Character>(defaultCharacter);

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