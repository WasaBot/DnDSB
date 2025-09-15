import type { Spell } from "./types/types";

export function groupAndSortSpells(spells: Spell[]) {
  const grouped: Record<number, Spell[]> = {};
  spells.forEach((spell) => {
    if (!grouped[spell.level]) {
      grouped[spell.level] = [];
    }
    grouped[spell.level].push(spell);
  });
  Object.keys(grouped).forEach((level) => {
    grouped[Number(level)].sort((a, b) => a.name.localeCompare(b.name));
  });
  return grouped;
}

export function convertRange(range: string, unit: "ft" | "m") {
  const regex = /(\d+)\s*ft\b/gi;
  if (unit === "m") {
    return range.replace(
      regex,
      (_, num) => `${Math.round(Number(num) * 0.3048)} m`
    );
  } else {
    return range;
  }
}

export function getCasterType(characterClass: string): string {
  const fullCasters = ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"];
  const halfCasters = ["Paladin", "Ranger"];
  const thirdCasters = ["Eldritch Knight", "Arcane Trickster"];
  if (fullCasters.includes(characterClass)) return "full-caster";
  else if (halfCasters.includes(characterClass)) return "half-caster";
  else if (thirdCasters.includes(characterClass)) return "subclass";
  else if (characterClass === "Warlock") return "warlock";
  return "None";
}

export function generateCharacterId(name: string, className: string, subclass?: string): string {
  // Clean the strings by removing spaces and special characters, converting to lowercase
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanClass = className.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanSubclass = subclass ? subclass.toLowerCase() : '';
  
  // Create the ID
  if (cleanSubclass) {
    return `${cleanName}_${cleanClass}_${cleanSubclass}`;
  } else {
    return `${cleanName}_${cleanClass}`;
  }
}
