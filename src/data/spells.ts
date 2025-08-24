// All spell and spellcasting data & helpers

export type Spell = {
  name: string;
  level: number;
  description: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
};

// Group and sort spells by level and name
export function groupAndSortSpells(spells: Spell[]) {
  const grouped: Record<number, Spell[]> = {};
  spells.forEach(spell => {
    if (!grouped[spell.level]) grouped[spell.level] = [];
    grouped[spell.level].push(spell);
  });
  Object.keys(grouped).forEach(level => {
    grouped[Number(level)].sort((a, b) => a.name.localeCompare(b.name));
  });
  return grouped;
}

// Convert ft <-> m for spell range display
export function convertRange(range: string, unit: "ft" | "m") {
  const regex = /(\d+)\s*ft\b/gi;
  if (unit === "m") {
    return range.replace(regex, (_, num) => `${Math.round(Number(num) * 0.3048)} m`);
  } else {
    return range;
  }
}