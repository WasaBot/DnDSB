import React, { useState, useEffect, useRef } from "react";
import { useSettings } from "../../../context/SettingsContext";
import "./spellbook.css";
import { fetchSpellByIndex } from "../../../utils/dbFuncs";
import supabase from "../../../utils/supabase";

const Spellbook: React.FC = () => {
  const { character, setCharacter } = useSettings();
  const [search, setSearch] = useState("");
  const [allSpells, setAllSpells] = useState<{name:string,index:string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [spell, setSpell] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCharacterSpells, setShowCharacterSpells] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const filteredSuggestions = allSpells.filter(spell =>
    spell.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10);

  const handleToggleCharacterSpell = (spellIndex: string) => {
    setCharacter(prev => {
      const spells: string[] = Array.isArray(prev.spellcasting?.spellIndices) ? prev.spellcasting.spellIndices : [];
      const updatedSpells = spells.includes(spellIndex)
        ? spells.filter((s: string) => s !== spellIndex)
        : [...spells, spellIndex];
      return {
        ...prev,
        spellcasting: {
          spellSlots: prev.spellcasting?.spellSlots !== undefined ? prev.spellcasting.spellSlots : [],
          spellIndices: updatedSpells
        }
      };
    });
  };

  useEffect(() => {
    const fetchAllSpells = async (): Promise<any> => {
    const { data, error } = await supabase
      .from('spells')
      .select('name,index');
    if (error) {
      throw new Error(error.message);
    } else {
      setAllSpells(data as any);
    };
  };
  fetchAllSpells();
  }, []);

  const handleSelectSuggestion = async (spellObj: any) => {
    setError(null);
    setSpell(null);
    setLoading(true);
    setSearch(spellObj.name);
    setShowSuggestions(false);
    try {
      const data = await fetchSpellByIndex(spellObj.index);
      setSpell(data);
    } catch (err: any) {
      setError(err.message);
      setSpell(null);
    }
    setLoading(false);
  };

  // Remove spell from character's spell list
  const handleRemoveCharacterSpell = (spellIndex: string) => {
    setCharacter(prev => {
      const spellIndices: string[] = Array.isArray(prev.spellcasting?.spellIndices) ? prev.spellcasting.spellIndices : [];
      return { ...prev, spellcasting: { spellSlots: prev.spellcasting?.spellSlots !== undefined ? prev.spellcasting.spellSlots : [], spellIndices: spellIndices.filter((s: string) => s !== spellIndex) } };
    });
  };

  // Handle click outside suggestions to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions]);

  const characterSpells: {name:string, index: string}[] = Array.isArray(character.spellcasting?.spellIndices) ? 
  character.spellcasting.spellIndices.map(index => ({name: allSpells.find((s: {name:string,index:string}) => s.index === index)?.name || "Unknown", index})) : [];

  return (
    <div>
      <h2>Spellbook</h2>
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          className="spellbook-myspells-btn"
          onClick={() => setShowCharacterSpells(v => !v)}
        >
          {showCharacterSpells ? "▼" : "►"} My Spells ({characterSpells.length})
        </button>
        {showCharacterSpells && (
          <ul className="spellbook-myspells-list">
            {characterSpells.length === 0 && (
              <li className="spellbook-myspells-empty">No spells added yet.</li>
            )}
            {characterSpells.map(spell => (
              <li
                key={spell.index}
                className="spellbook-myspells-listitem"
              >
                <span>{spell.name}</span>
                <button
                  type="button"
                  className="spellbook-myspells-remove-btn"
                  onClick={() => handleRemoveCharacterSpell(spell.index)}
                  title="Remove spell"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (filteredSuggestions.length > 0) handleSelectSuggestion(filteredSuggestions[0]);
        }}
        className="spellbook-search-form"
        autoComplete="off"
      >
        <input
          type="text"
          placeholder="Search for a spell..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          className="spellbook-search-input"
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            } else if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
              e.preventDefault();
              // Focus first suggestion (could be enhanced further with keyboard navigation)
            }
          }}
        />
        <button type="submit" className="spellbook-search-btn">Search</button>
        {showSuggestions && search.length > 0 && (
          <ul
            ref={suggestionsRef}
            className="spellbook-suggestions"
          >
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((s: {name:string,index:string}) => (
                <li
                  key={s.index}
                  className="spellbook-suggestion-item"
                  onClick={() => handleSelectSuggestion(s)}
                >
                  {s.name}
                </li>
              ))
            ) : (
              <li className="spellbook-suggestion-item" style={{ fontStyle: 'italic', color: '#666' }}>
                No spells found
              </li>
            )}
          </ul>
        )}
      </form>
      {loading && <p>Loading spell...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {spell && (
        <div className="spellbook-spell-details">
          <div className="spellbook-spell-details-header">
            <h3 style={{ margin: 0 }}>{spell.name}</h3>
            <label className="spellbook-spell-details-checkbox">
              <input
                type="checkbox"
                checked={characterSpells.some(charSpell => charSpell.index === spell.index)}
                onChange={() => handleToggleCharacterSpell(spell.index)}
              />
              Add to character
            </label>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(spell, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Spellbook;