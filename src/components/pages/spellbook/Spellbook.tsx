import React, { useState, useEffect, useRef, use } from "react";
import { useSettings } from "../../../context/SettingsContext";
import "./spellbook.css";
import { fetchSpellByIndex } from "../../../utils/dbFuncs";
import supabase from "../../../utils/supabase";

const Spellbook: React.FC = () => {
  const { character, setCharacter } = useSettings();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<{name:string,index:string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [spell, setSpell] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCharacterSpells, setShowCharacterSpells] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const handleToggleCharacterSpell = (spellName: string) => {
    setCharacter(prev => {
      const spells: string[] = Array.isArray(prev.spellcasting?.spells) ? prev.spellcasting.spells : [];
      if (spells.includes(spellName)) {
        return { ...prev, spells: spells.filter((s: string) => s !== spellName) };
      } else {
        return { ...prev, spells: [...spells, spellName] };
      }
    });
  };

  useEffect(() => {
    const fetchSuggestions = async (): Promise<any> => {
    const { data, error } = await supabase
      .from('spells')
      .select('name,index');
    if (error) {
      throw new Error(error.message);
    } else {
      setSuggestions(data as any);
    };
  };
  fetchSuggestions();
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
  const handleRemoveCharacterSpell = (spellName: string) => {
    setCharacter(prev => {
      const spells: string[] = Array.isArray(prev.spells) ? prev.spells : [];
      return { ...prev, spells: spells.filter((s: string) => s !== spellName) };
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

  const characterSpells: string[] = Array.isArray(character.spells) ? character.spells : [];

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
            {characterSpells.map(spellName => (
              <li
                key={spellName}
                className="spellbook-myspells-listitem"
              >
                <span>{spellName}</span>
                <button
                  type="button"
                  className="spellbook-myspells-remove-btn"
                  onClick={() => handleRemoveCharacterSpell(spellName)}
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
          if (suggestions.length > 0) handleSelectSuggestion(suggestions[0]);
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
            setShowSuggestions(true);
          }}
          className="spellbook-search-input"
          onFocus={() => setShowSuggestions(true)}
        />
        <button type="submit" className="spellbook-search-btn">Search</button>
        {showSuggestions && suggestions.length > 0 && (
          <ul
            ref={suggestionsRef}
            className="spellbook-suggestions"
          >
            {loadingSuggestions && (
              <li style={{ padding: 8 }}>Loading...</li>
            )}
            {suggestions.map(s => (
              <li
                key={s.index}
                className="spellbook-suggestion-item"
                onClick={() => handleSelectSuggestion(s)}
              >
                {s.name}
              </li>
            ))}
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
                checked={characterSpells.includes(spell.name)}
                onChange={() => handleToggleCharacterSpell(spell.name)}
              />
              Add to character
              {/* TODO: add  to character fixen */}
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