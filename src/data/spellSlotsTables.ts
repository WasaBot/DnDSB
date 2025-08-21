// Spell slot tables for D&D 5e classes (levels 1-20)
// Each array entry is the number of slots for spell levels 1-9 (0 if not available)

export type SpellSlotsTable = Record<number, number[]>;

export const fullCasterSlots: SpellSlotsTable = {
  1: [2],
  2: [3],
  3: [4, 2],
  4: [4, 3],
  5: [4, 3, 2],
  6: [4, 3, 3],
  7: [4, 3, 3, 1],
  8: [4, 3, 3, 2],
  9: [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1],
  15: [4, 3, 3, 3, 2, 1, 1, 1],
  16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

export const halfCasterSlots: SpellSlotsTable = {
  1: [],
  2: [2],
  3: [3],
  4: [3],
  5: [4, 2],
  6: [4, 2],
  7: [4, 3],
  8: [4, 3],
  9: [4, 3, 2],
  10: [4, 3, 2],
  11: [4, 3, 3],
  12: [4, 3, 3],
  13: [4, 3, 3, 1],
  14: [4, 3, 3, 1],
  15: [4, 3, 3, 2],
  16: [4, 3, 3, 2],
  17: [4, 3, 3, 2, 1],
  18: [4, 3, 3, 2, 1],
  19: [4, 3, 3, 2, 2],
  20: [4, 3, 3, 2, 2],
};

export const thirdCasterSlots: SpellSlotsTable = {
  1: [],
  2: [],
  3: [2],
  4: [3],
  5: [3],
  6: [3],
  7: [4, 2],
  8: [4, 2],
  9: [4, 2],
  10: [4, 3],
  11: [4, 3],
  12: [4, 3],
  13: [4, 3, 2],
  14: [4, 3, 2],
  15: [4, 3, 2],
  16: [4, 3, 3],
  17: [4, 3, 3],
  18: [4, 3, 3],
  19: [4, 3, 3, 1],
  20: [4, 3, 3, 1],
};

// Class to slot table mapping
export const classToSlotsTable: Record<string, SpellSlotsTable> = {
  Wizard: fullCasterSlots,
  Cleric: fullCasterSlots,
  Druid: fullCasterSlots,
  Bard: fullCasterSlots,
  Sorcerer: fullCasterSlots,
  Warlock: fullCasterSlots, // Warlock has Pact Magic, but for simplicity use full caster here
  Paladin: halfCasterSlots,
  Ranger: halfCasterSlots,
  Artificer: halfCasterSlots,
  EldritchKnight: thirdCasterSlots,
  ArcaneTrickster: thirdCasterSlots,
};