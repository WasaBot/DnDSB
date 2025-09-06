import type { Character } from "./types/types";

function getAbilityModifier(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2);
}

export function getSpellAbilityMod(character: Character): number | null {
  if (!character.class.spellcastingAbility) return null;
  switch (character.class.spellcastingAbility) {
    case 'Charisma':
      return getAbilityModifier(character.attributes['Charisma']);
    case 'Wisdom':
      return getAbilityModifier(character.attributes['Wisdom']);
    case 'Intelligence':
      return getAbilityModifier(character.attributes['Intelligence']);
    default:
      return null;
  }
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