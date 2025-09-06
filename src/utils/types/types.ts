export const ClassNames = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];
export type ClassName = typeof ClassNames[number];

export const AttributeNames = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];
export type AttributeName = typeof AttributeNames[number];

interface Class {
  name: ClassName;
  spellcastingAbility?: AttributeName;
}

interface Attributes {
  Strength: number;
  Dexterity: number;
  Constitution: number;
  Intelligence: number;
  Wisdom: number;
  Charisma: number;
}

interface Spellcasting {
  spellIndices: string[];
  spellSlots: number[];
}

export type Character = {
  name: string;
  class: Class;
  level: number;
  attributes: Attributes;
  spellcasting?: Spellcasting;
};

export type Spell = {
  index: string;
  name: string;
  level: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  description: string;
  castingTime: '1 Action' | '1 Bonus Action' | '1 Reaction' | '10 Minutes' | '1 Minute' | 'Special';
  range: string;
  components: 'V' | 'S' | 'M' | 'VS' | 'VM' | 'SM' | 'VSM';
  duration: string;
  ritual: boolean;
  concentration: boolean;
  school: string;
  attackType?: 'Melee' | 'Ranged' | 'Melee or Ranged' | 'Save';
  spellSaveDc?: {
    dcType: AttributeName;
    dcSuccess: 'None' | 'Half' | 'Negates';
  };
  damage?: {
    damageType: string;
    damageAtSlotLevel: { [key: string]: string };
  }
  healAtSlotLevel?: { [key: string]: string };
  material?: string;
  aoe?: string;
  aoe_type?: 'sphere' | 'cube' | 'cone' | 'line' | 'cylinder';
};

export type SettingsContextType = {
  unit: UnitType;
  setUnit: (unit: UnitType) => void;
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
};

export type UnitType = "m" | "ft";