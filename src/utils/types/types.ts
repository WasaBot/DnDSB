export const ClassNames = [
    "Barbarian",
    "Bard",
    "Cleric",
    "Druid",
    "Fighter",
    "Monk",
    "Paladin",
    "Ranger",
    "Rogue",
    "Sorcerer",
    "Warlock",
    "Wizard",
];
export type ClassName = (typeof ClassNames)[number];

export const AttributeNames = [
    "Strength",
    "Dexterity",
    "Constitution",
    "Intelligence",
    "Wisdom",
    "Charisma",
];
export type AttributeName = (typeof AttributeNames)[number];
export type SpellComponents = 'V' | 'S' | 'M' | 'VS' | 'VM' | 'SM' | 'VSM';

interface Class {
    name: ClassName;
    spellcastingAbility?: AttributeName;
    subclass?: Subclass;
}

export interface Subclass {
    id: string;
    name: string;
    spellcastingAbility?: AttributeName;
    landType?: string; // For Circle of the Land druids
}

interface Attributes {
    Strength: number;
    Dexterity: number;
    Constitution: number;
    Intelligence: number;
    Wisdom: number;
    Charisma: number;
}

export type Character = {
    id: string;
    name: string;
    class: Class;
    level: number;
    attributes: Attributes;
    spellIndices?: string[]; // Prepared spells
    knownSpellIndices?: string[]; // Known spells that can be prepared
    alwaysPreparedSpells?: string[]; // Spells that are always prepared for this character
};

export type Spell = {
    additionalDesc: boolean;
    alwaysRemembered?: boolean;
    aoeSize?: number;
    aoeType?: string;
    atHigherLevel?: string;
    attackType: string;
    castingTime: string;
    components: SpellComponents;
    concentration: boolean;
    damageType?: string;
    dcDesc?: string;
    dcSuccess?: string;
    desc: string;
    dmgAtCharLvl?: string;
    dmgAtHigherSlot?: boolean;
    duration: string;
    hasTable: boolean;
    healAtHigherSlot?: boolean;
    index: string;
    level: number;
    material?: string;
    name: string;
    range: string;
    ritual: boolean;
    school: string;
    spellSaveDcType?: string;
};

export type SettingsContextType = {
    unit: UnitType;
    setUnit: (unit: UnitType) => void;
    character: Character;
    setCharacter: React.Dispatch<React.SetStateAction<Character>>;
};

export type UnitType = "m" | "ft";
