import type { Character } from "./types/types";

const abilityModifiers: Record<string, (score: number) => number> = {
  strength: (score: number) => Math.floor((score - 10) / 2),
  dexterity: (score: number) => Math.floor((score - 10) / 2),
  constitution: (score: number) => Math.floor((score - 10) / 2),
  intelligence: (score: number) => Math.floor((score - 10) / 2),
  wisdom: (score: number) => Math.floor((score - 10) / 2),
  charisma: (score: number) => Math.floor((score - 10) / 2),
};

export function getSpellAbilityMod(character: Character): number | null {
  if (!character.class.spellcastingAbility) return null;
  return abilityModifiers[character.class.spellcastingAbility](character[character.class.spellcastingAbility]);
}

function getProficiencyBonus(level: number): number {
  return 2 + Math.floor((level - 1) / 4);
}

export function getSpellSaveDC(character: Character): number | null {
  const mod = getSpellAbilityMod(character);
  if (mod === null) return null;
  return 8 + getProficiencyBonus(character.level) + mod;
}

export function getSpellAttackBonus(character: Character): number | null {
  const mod = getSpellAbilityMod(character);
  if (mod === null) return null;
  return getProficiencyBonus(character.level) + mod;
}