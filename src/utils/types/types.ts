export const ClassNames = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];
export type ClassName = typeof ClassNames[number];

interface Class {
  name: ClassName;
  spellcastingAbility?: string;
}

interface Attributes {
  name: string;
  class: Class;
  level: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface Spellcasting {
  spells: string[];
  spellSlots: number[];
}

export type Character = {
  name: string;
  class: Class;
  level: number;
  attributes?: Attributes;
  spellcasting?: Spellcasting;
  [key: string]: any;
};

export type Spell = {
  name: string;
  level: number;
  description: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
};

export type SettingsContextType = {
  unit: UnitType;
  setUnit: (unit: UnitType) => void;
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
};

export type UnitType = "m" | "ft";