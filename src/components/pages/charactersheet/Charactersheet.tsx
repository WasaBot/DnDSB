import React, { useEffect, useMemo, useState } from "react";
import { useSettings } from "../../../context/SettingsContext";
import BarbarianResources from "./classes/BarbarianResources";
import BardResources from "./classes/BardResources";
import ClericResources from "./classes/ClericResources";
import DruidResources from "./classes/DruidResources";
import FighterResources from "./classes/FighterResources";
import MonkResources from "./classes/MonkResources";
import PaladinResources from "./classes/PaladinResources";
import RangerResources from "./classes/RangerResources";
import RogueResources from "./classes/RogueResources";
import SorcererResources from "./classes/SorcererResources";
import WarlockResources from "./classes/WarlockResources";
import WizardResources from "./classes/WizardResources";
import { groupAndSortSpells } from "../../../utils/functions";
import { fetchSpellByIndex, fetchSpellslots } from "../../../utils/dbFuncs";
import { getSpellSaveDC, getSpellAttackBonus } from "../../../utils/characterFuncs";
import type { Spell } from "../../../utils/types/types";

const USED_SLOTS_STORAGE_KEY = "usedSlots";

const CharacterSheet: React.FC = () => {
  const { character } = useSettings();
  const classResourceMap: Record<string, React.FC> = {
    Barbarian: BarbarianResources,
    Bard: BardResources,
    Cleric: ClericResources,
    Druid: DruidResources,
    Fighter: FighterResources,
    Monk: MonkResources,
    Paladin: PaladinResources,
    Ranger: RangerResources,
    Rogue: RogueResources,
    Sorcerer: SorcererResources,
    Warlock: WarlockResources,
    Wizard: WizardResources,
  };
  const ClassSpecificResources = classResourceMap[character.class.name] || null;

  // Spellcasting state
  const [openSpell, setOpenSpell] = useState<string | null>(null);
  const [openLevels, setOpenLevels] = useState<Record<number, boolean>>({});
  const [usedSlots, setUsedSlots] = useState<Record<number, boolean[]>>(() => {
    try {
      const saved = localStorage.getItem(USED_SLOTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showConcentration, setShowConcentration] = useState<boolean>(false);
  const [concentrationCount, setConcentrationCount] = useState<number>(0);
  const [usedResources, setUsedResources] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`resources_${character.class.name}`);
      return saved ? JSON.parse(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Spell slots
  const [spellSlots, setSpellSlots] = useState<number[] | null>(null);
  useEffect(() => {
    const loadSpellSlots = async () => {
      const result = await fetchSpellslots(character);      
      if (Array.isArray(result) && result.length > 0) {        
        const slots = Object.values(result[0])[0] as number[];
        setSpellSlots(slots);
      } else {
        setSpellSlots(null);
      }
    };
    loadSpellSlots();
  }, [character.level, character.class.name]);

  useEffect(() => {
    try {
      localStorage.setItem(USED_SLOTS_STORAGE_KEY, JSON.stringify(usedSlots));
    } catch {}
  }, [usedSlots]);

  useEffect(() => {
    try {
      localStorage.setItem(`resources_${character.class.name}`, JSON.stringify(usedResources));
    } catch {}
  }, [usedResources, character.class.name]);

  // Spells
  const characterSpellIndices: string[] = Array.isArray(character.spellcasting?.spellIndices) ? character.spellcasting.spellIndices : [];
  const [dbSpellDetails, setDbSpellDetails] = useState<Record<string, any>>({});
  const fetchAndCacheSpell = async (spellIndex: string) => {
    if (dbSpellDetails[spellIndex]) return;
    try {
      const data = await fetchSpellByIndex(spellIndex);
      setDbSpellDetails(prev => ({ ...prev, [spellIndex]: data }));
    } catch {
      setDbSpellDetails(prev => ({ ...prev, [spellIndex]: { name: "Unknown", index: spellIndex, description: "Not found in API.", level: 0 } }));
    }
  };
  // characterSpells is now array of {name, index}
  const characterSpells: { name: string; index: string }[] = useMemo(() => {
    return characterSpellIndices.map((spellIndex: string) => {
      const spell = dbSpellDetails[spellIndex];
      if (spell) return { name: spell.name || "Unknown", index: spellIndex };
      fetchAndCacheSpell(spellIndex);
      return { name: "Loading...", index: spellIndex };
    });
    // eslint-disable-next-line
  }, [characterSpellIndices, dbSpellDetails]);
  // For spell details UI, filter spells from character's indices that have been loaded
  const filteredCharacterSpells = characterSpellIndices
    .map(index => dbSpellDetails[index])
    .filter((s: any) => s && typeof s.level === "number");
  const groupedSpells = groupAndSortSpells(filteredCharacterSpells);

  // Spell slot checkbox toggle
  const handleSlotToggle = (level: number, idx: number) => {
    setUsedSlots(prev => {
      const arr = prev[level] ? [...prev[level]] : Array(spellSlots?.[level - 1] || 0).fill(false);
      arr[idx] = !arr[idx];
      return { ...prev, [level]: arr };
    });
  };
  // Spell level dropdown toggle
  const handleLevelToggle = (level: number) => {
    setOpenLevels(prev => ({ ...prev, [level]: !prev[level] }));
  };
  // Long rest: reset all slots and resources
  const handleLongRest = () => {
    if (spellSlots) {
      const reset: Record<number, boolean[]> = {};
      spellSlots.forEach((slots, i) => {
        if (slots > 0) reset[i + 1] = Array(slots).fill(false);
      });
      setUsedSlots(reset);
      setUsedResources(0);
    }
  };
  // Short rest: reset warlock slots only
  const handleShortRest = () => {
    if (character.class.name === "Warlock" && spellSlots) {
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
        <b>Class:</b> {character.class.name}<br />
        <b>Level:</b> {character.level}
      </p>

      <div>
        <h2>Class Resources</h2>
        {ClassSpecificResources && React.createElement(ClassSpecificResources)}
      </div>

      {/* Spellcasting UI */}
      {character.class.spellcastingAbility && (
        <div>
          <h3>Spellcasting</h3>
          <div><b>Spellcasting Attribute:</b> {character.class.spellcastingAbility || "Loading..."}</div>
          <ul>
            <li>
              <b>Spell Save DC:</b> {getSpellSaveDC(character)}
            </li>
            <li>
              <b>Spell Attack Bonus:</b> +{getSpellAttackBonus(character)}
            </li>
          </ul>
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
          <div className="charactersheet-spell-section">
            <h4>Available Spells</h4>
            {/* Debug info */}
            <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
              Debug: Spell indices: {characterSpellIndices.length}, Loaded spells: {Object.keys(dbSpellDetails).length}, Filtered spells: {filteredCharacterSpells.length}
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
                    {groupedSpells[0].map((spell: any) => (
                      <li key={spell.name} className="charactersheet-spell-listitem">
                        <div
                          className="charactersheet-spell-row"
                          onClick={() => setOpenSpell(openSpell === spell.name ? null : spell.name)}
                        >
                          <span>
                            <b>{spell.name}</b> | {spell.castingTime} | {spell.range} | {spell.components} | {spell.duration}
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
                      {Array.from({ length: spellSlots?.[level - 1] || 0 }).map((_, idx) => (
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
                      {groupedSpells[level].map((spell: any) => (
                        <li key={spell.name} className="charactersheet-spell-listitem">
                          <div
                            className="charactersheet-spell-row"
                            onClick={() => setOpenSpell(openSpell === spell.name ? null : spell.name)}
                          >
                            <span>
                              <b>{spell.name}</b> | {spell.castingTime} | {spell.range} | {spell.components} | {spell.duration}
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
        </div>
      )}
    </div>
  );
};

export default CharacterSheet;