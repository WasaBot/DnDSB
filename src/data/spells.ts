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

export const exampleSpells: Spell[] = [
  {
    name: "Mage Hand",
    level: 0,
    description: "A spectral, floating hand appears at a point you choose.",
    castingTime: "1 action",
    range: "30 ft",
    components: "V, S",
    duration: "1 minute",
  },
  {
    name: "Magic Missile",
    level: 1,
    description: "Shoots 3 darts of magical force. Each dart hits a creature of your choice.",
    castingTime: "1 action",
    range: "120 ft",
    components: "V, S",
    duration: "Instantaneous",
  },
  {
    name: "Fireball",
    level: 3,
    description: "A bright streak flashes to a point you choose, then explodes in a 20-foot-radius sphere.",
    castingTime: "1 action",
    range: "150 ft",
    components: "V, S, M (a tiny ball of bat guano and sulfur)",
    duration: "Instantaneous",
  },
  {
    name: "Mage Armor",
    level: 1,
    description: "Protective magical force surrounds you, raising your AC.",
    castingTime: "1 action",
    range: "Touch",
    components: "V, S, M (a piece of cured leather)",
    duration: "8 hours",
  },
];

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