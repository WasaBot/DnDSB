// API helper for fetching spell data from dnd5eapi.co

const BASE_URL = "https://www.dnd5eapi.co/api/spells/";

export async function fetchSpellByName(name: string) {
  // The API expects the spell index (lowercase, hyphens for spaces)
  const spellIndex = name.trim().toLowerCase().replace(/\s+/g, "-");
  const url = `${BASE_URL}${spellIndex}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Spell not found");
  return response.json();
}