import React, { useState, useMemo } from "react";
import { useSettings } from "../../../context/SettingsContext";
import { classToSlotsTable } from "../../../data/spellSlotsTables";
import { groupAndSortSpells, convertRange } from "../../../data/spells";
import "./charactersheet.css";

const classSpellcastingAbility: Record<string, keyof typeof abilityModifiers> = {
  Bard: "charisma",
  Cleric: "wisdom",
  Druid: "wisdom",
  Sorcerer: "charisma",
  Warlock: "charisma",
  Wizard: "intelligence",
  Paladin: "charisma",
  Ranger: "wisdom"
};

const abilityModifiers = {
  strength: (score: number) => Math.floor((score - 10) / 2),
  dexterity: (score: number) => Math.floor((score - 10) / 2),
  constitution: (score: number) => Math.floor((score - 10) / 2),
  intelligence: (score: number) => Math.floor((score - 10) / 2),
  wisdom: (score: number) => Math.floor((score - 10) / 2),
  charisma: (score: number) => Math.floor((score - 10) / 2),
};

function getProficiencyBonus(level: number) {
  return 2 + Math.floor((level - 1) / 4);
}

function getSpellAbilityMod(character: any) {
  const ability = classSpellcastingAbility[character.class];
  if (!ability) return null;
  return abilityModifiers[ability](character[ability]);
}

function getSpellSaveDC(character: any) {
  const mod = getSpellAbilityMod(character);
  if (mod === null) return null;
  return 8 + getProficiencyBonus(character.level) + mod;
}

function getSpellAttackBonus(character: any) {
  const mod = getSpellAbilityMod(character);
  if (mod === null) return null;
  return getProficiencyBonus(character.level) + mod;
}

// CharacterSheet component
const CharacterSheet: React.FC = () => {
  const { unit, character } = useSettings();
  const isSpellcaster = !!classToSlotsTable[character.class];
  const [openSpell, setOpenSpell] = useState<string | null>(null);
  const [openLevels, setOpenLevels] = useState<Record<number, boolean>>({});
  const [usedSlots, setUsedSlots] = useState<Record<number, boolean[]>>({});
  // Concentration counter state
  const [showConcentration, setShowConcentration] = useState(false);
  const [concentrationCount, setConcentrationCount] = useState(0);

  // Get spell slots for the character's level and class
  const spellSlotsTable = classToSlotsTable[character.class] || {};
  const spellSlots = spellSlotsTable[character.level] || [];

  // Build spell list from character.spells (default empty)
  const characterSpellNames: string[] = Array.isArray(character.spells) ? character.spells : [];

  // Use spells from character.spells and fetch from API if needed
  const [apiSpellDetails, setApiSpellDetails] = useState<Record<string, any>>({});

  // Helper to fetch spell details from API if not already fetched
  const fetchAndCacheSpell = async (spellName: string) => {
    if (apiSpellDetails[spellName]) return;
    const { fetchSpellByName } = await import("../../../api/spellsApi");
    try {
      const data = await fetchSpellByName(spellName);
      setApiSpellDetails(prev => ({ ...prev, [spellName]: data }));
    } catch {
      setApiSpellDetails(prev => ({ ...prev, [spellName]: { name: spellName, description: "Not found in API." } }));
    }
  };

  // Memoized list of spell objects for the character
  const characterSpells = useMemo(() => {
    return characterSpellNames.map(name => {
      if (apiSpellDetails[name]) return apiSpellDetails[name];
      fetchAndCacheSpell(name);
      return { name, description: "Loading...", level: 0, castingTime: "", range: "", components: "", duration: "" };
    });
    // eslint-disable-next-line
  }, [characterSpellNames, apiSpellDetails]);

  // Only show spells that have a level property (API spells may not have it until loaded)
  const filteredCharacterSpells = characterSpells.filter(s => typeof s.level === "number");

  // Group and sort spells
  const groupedSpells = groupAndSortSpells(filteredCharacterSpells);

  // Handle spell slot checkbox toggle
  const handleSlotToggle = (level: number, idx: number) => {
    setUsedSlots(prev => {
      const arr = prev[level] ? [...prev[level]] : Array(spellSlots[level - 1] || 0).fill(false);
      arr[idx] = !arr[idx];
      return { ...prev, [level]: arr };
    });
  };

  // Handle spell level dropdown toggle
  const handleLevelToggle = (level: number) => {
    setOpenLevels(prev => ({ ...prev, [level]: !prev[level] }));
  };

  // Handle long rest: reset all slots
  const handleLongRest = () => {
    const reset: Record<number, boolean[]> = {};
    spellSlots.forEach((slots, i) => {
      if (slots > 0) reset[i + 1] = Array(slots).fill(false);
    });
    setUsedSlots(reset);
  };

  // Handle short rest: reset warlock slots only
  const handleShortRest = () => {
    if (character.class === "Warlock") {
      const reset: Record<number, boolean[]> = {};
      spellSlots.forEach((slots, i) => {
        if (slots > 0) reset[i + 1] = Array(slots).fill(false);
      });
      setUsedSlots(reset);
    }
  };

  return (
    <div>
      <h2>Character Sheet</h2>
      <p>
        <b>Name:</b> {character.name}<br />
        <b>Class:</b> {character.class}<br />
        <b>Level:</b> {character.level}
      </p>
      {isSpellcaster && (
        <>
          <h3>Spellcasting</h3>
          {/* Concentration Counter */}
          <div className="charactersheet-concentration-row">
            <button
              type="button"
              className={`charactersheet-concentration-toggle${showConcentration ? " active" : ""}`}
              onClick={() => setShowConcentration(v => !v)}
            >
              {showConcentration ? "Hide Concentration Counter" : "Show Concentration Counter"}
            </button>
            {showConcentration && (
              <button
                type="button"
                className="charactersheet-concentration-counter"
                onClick={() => setConcentrationCount(c => c + 1)}
                title="Click to increase concentration count"
              >
                Concentration: {concentrationCount}
              </button>
            )}
          </div>
          <ul>
            <li>
              <b>Spell Save DC:</b> {getSpellSaveDC(character)}
            </li>
            <li>
              <b>Spell Attack Bonus:</b> +{getSpellAttackBonus(character)}
            </li>
          </ul>
          <div className="charactersheet-spell-section">
            <h4>Available Spells</h4>
            <div style={{float: "right", textAlign: "right", marginBottom: 10}}>
              <p>Sorcery Points:</p>
              <input type="checkbox" />
              <input type="checkbox" />
              <input type="checkbox" />
              <input type="checkbox" />
              <input type="checkbox" />
              <input type="checkbox" />
            </div>
            {/* Cantrips */}
            {groupedSpells[0] && (
              <div style={{marginBottom: 10, width: "100%"}}>
                <button
                  type="button"
                  className="charactersheet-spelllevel-btn"
                  onClick={() => handleLevelToggle(0)}
                >
                  {openLevels[0] ? "▼" : "►"} Cantrips
                </button>
                {openLevels[0] && (
                  <ul className="charactersheet-spell-list">
                    {groupedSpells[0].map(spell => (
                      <li key={spell.name} className="charactersheet-spell-listitem">
                        <div
                          className="charactersheet-spell-row"
                          onClick={() => setOpenSpell(openSpell === spell.name ? null : spell.name)}
                        >
                          <span>
                            <b>{spell.name}</b> | {spell.castingTime} | {convertRange(spell.range, unit)} | {spell.components} | {spell.duration}
                          </span>
                          <span>
                            {openSpell === spell.name ? "▲" : "▼"}
                          </span>
                        </div>
                        {openSpell === spell.name && (
                          <div className="charactersheet-spell-details">
                            <i>{spell.description}</i>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {/* Spell levels 1+ */}
            {Object.keys(groupedSpells)
              .map(Number)
              .filter(level => level > 0)
              .sort((a, b) => a - b)
              .map(level => (
                <div key={level} style={{marginBottom: 10, width: "100%"}}>
                  <div style={{display: "flex", alignItems: "center", width: "100%"}}>
                    <button
                      type="button"
                      className="charactersheet-spelllevel-btn"
                      onClick={() => handleLevelToggle(level)}
                    >
                      {openLevels[level] ? "▼" : "►"} Level {level} Spells
                    </button>
                    {/* Spell slot checkboxes always visible */}
                    <span className="charactersheet-spelllevel-checkboxes">
                      {Array.from({ length: spellSlots[level - 1] || 0 }).map((_, idx) => (
                        <label key={idx}>
                          <input
                            type="checkbox"
                            checked={usedSlots[level]?.[idx] || false}
                            onChange={() => handleSlotToggle(level, idx)}
                          />
                        </label>
                      ))}
                    </span>
                  </div>
                  {openLevels[level] && (
                    <ul className="charactersheet-spell-list">
                      {groupedSpells[level].map(spell => (
                        <li key={spell.name} className="charactersheet-spell-listitem">
                          <div
                            className="charactersheet-spell-row"
                            onClick={() => setOpenSpell(openSpell === spell.name ? null : spell.name)}
                          >
                            <span>
                              <b>{spell.name}</b> | {spell.castingTime} | {convertRange(spell.range, unit)} | {spell.components} | {spell.duration}
                            </span>
                            <span>
                              {openSpell === spell.name ? "▲" : "▼"}
                            </span>
                          </div>
                          {openSpell === spell.name && (
                            <div className="charactersheet-spell-details">
                              <i>{spell.description}</i>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            {/* Rest buttons */}
            <div className="charactersheet-rest-btns">
              <button
                type="button"
                className="charactersheet-rest-btn"
                onClick={handleLongRest}
              >
                Long Rest
              </button>
              <button
                type="button"
                className="charactersheet-rest-btn"
                onClick={handleShortRest}
              >
                Short Rest
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CharacterSheet;