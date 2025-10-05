import React, { useState, useEffect, useRef } from "react";
import { useSettings } from "../../../context/SettingsContext";
import "./spellbook.css";
import { fetchSpellByIndex } from "../../../utils/dbFuncs";
import { getAlwaysPreparedSpells, getAlwaysRememberedSpells, toggleAlwaysRememberedSpell, isSpellAlwaysRemembered } from "../../../utils/functions";
import supabase from "../../../utils/supabase";
import Spelllist from "../../partials/spelllist/Spelllist";
import type { Spell } from "../../../utils/types/types";
import { groupAndSortSpells } from "../../../utils/functions";

const Spellbook: React.FC = () => {
    const { character, setCharacter } = useSettings();
    const [search, setSearch] = useState("");
    const [allSpells, setAllSpells] = useState<
        { name: string; index: string }[]
    >([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [spell, setSpell] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCharacterSpells, setShowCharacterSpells] = useState(false);
    const [alwaysPreparedSpellIndices, setAlwaysPreparedSpellIndices] = useState<string[]>([]);
    const [preparedSpells, setPreparedSpells] = useState<Spell[]>([]);
    const [characterSpells, setCharacterSpells] = useState<Spell[]>([]);
    const [knownSpells, setKnownSpells] = useState<Spell[]>([]);
    const [showPreparedSpells, setShowPreparedSpells] = useState(false);
    const [showKnownSpells, setShowKnownSpells] = useState(false);
    const suggestionsRef = useRef<HTMLUListElement>(null);

    // Check if character class uses known spells system
    const usesKnownSpells = () => {
        const className = character.class.name.toLowerCase();
        return ['wizard', 'cleric', 'druid'].includes(className);
    };

    const filteredSuggestions = allSpells
        .filter((spell) => {
            const matchesSearch = spell.name.toLowerCase().includes(search.toLowerCase());
            const isNotAlwaysPrepared = !alwaysPreparedSpellIndices.includes(spell.index);
            const isNotKnown = usesKnownSpells() ? !(character.knownSpellIndices?.includes(spell.index) || false) : true;
            const isNotCharacterSpell = !(character.spellIndices?.includes(spell.index) || false);
            return matchesSearch && isNotAlwaysPrepared && isNotKnown && isNotCharacterSpell;
        })
        .slice(0, 10);

    const handleToggleCharacterSpell = (spellIndex: string) => {
        setCharacter((prev) => {
            const spells: string[] = Array.isArray(prev.spellIndices)
                ? prev.spellIndices
                : [];
            const updatedSpells = spells.includes(spellIndex)
                ? spells.filter((s: string) => s !== spellIndex)
                : [...spells, spellIndex];
            return {
                ...prev,
                spellIndices: updatedSpells,
            };
        });
    };

    const handleToggleKnownSpell = (spellIndex: string, _spellName?: string) => {
        setCharacter((prev) => {
            const knownSpells: string[] = Array.isArray(prev.knownSpellIndices)
                ? prev.knownSpellIndices
                : [];
            const updatedKnownSpells = knownSpells.includes(spellIndex)
                ? knownSpells.filter((s: string) => s !== spellIndex)
                : [...knownSpells, spellIndex];
            return {
                ...prev,
                knownSpellIndices: updatedKnownSpells,
            };
        });
    };

    const handleMoveToPrepared = async (spellIndex: string, _spellName: string) => {
        // Move from known spells to always remembered
        toggleAlwaysRememberedSpell(character.id, spellIndex);
        // Remove from known spells
        handleToggleKnownSpell(spellIndex);
        // Reload both lists
        await loadAlwaysPreparedSpells();
        await loadPreparedSpells();
    };

    const getAlwaysPreparedSpellNames = () => {
        return alwaysPreparedSpellIndices
            .map(index => allSpells.find(spell => spell.index === index))
            .filter(spell => spell)
            .map(spell => spell!.name)
            .sort();
    };

    const handleAlwaysRememberedToggle = async (spellIndex: string) => {
        toggleAlwaysRememberedSpell(character.id, spellIndex);
        // Reload always prepared spells to reflect changes
        await loadAlwaysPreparedSpells();
        await loadPreparedSpells();
    };

    const handleRemoveAlwaysRemembered = async (spellIndex: string) => {        
        toggleAlwaysRememberedSpell(character.id, spellIndex);
        await loadAlwaysPreparedSpells();
        await loadPreparedSpells();
    };

    const handleMovePreparedToKnown = async (spellIndex: string, spellName: string) => {
        if (confirm(`Move "${spellName}" back to known spells?`)) {
            // Remove from character spells (prepared)
            handleToggleCharacterSpell(spellIndex);
            // Add to known spells
            handleToggleKnownSpell(spellIndex);
            // No need to reload prepared spells since they update automatically
        }
    };

    const handleDeletePreparedSpell = async (spellIndex: string, spellName: string) => {
        if (confirm(`Delete "${spellName}" completely? This will remove it from all lists.`)) {
            // Remove from character spells (prepared)
            if (character.spellIndices?.includes(spellIndex)) {
                handleToggleCharacterSpell(spellIndex);
            }
            // Remove from known spells if present
            if (character.knownSpellIndices?.includes(spellIndex)) {
                handleToggleKnownSpell(spellIndex);
            }
            // Remove from always remembered if present
            if (getAlwaysRememberedSpells(character.id).includes(spellIndex)) {
                toggleAlwaysRememberedSpell(character.id, spellIndex);
                await loadAlwaysPreparedSpells();
                await loadPreparedSpells();
            }
        }
    };

    useEffect(() => {
        const fetchAllSpells = async (): Promise<any> => {
            const { data, error } = await supabase
                .from("spells")
                .select("name,index");
            if (error) {
                throw new Error(error.message);
            } else {
                setAllSpells(data as any);
            }
        };
        fetchAllSpells();
    }, []);

    const loadAlwaysPreparedSpells = async () => {
        const alwaysPreparedIndices = await getAlwaysPreparedSpells(character);
        const alwaysRememberedIndices = getAlwaysRememberedSpells(character.id);
        const allAlwaysSpellIndices = [...alwaysPreparedIndices, ...alwaysRememberedIndices];
        setAlwaysPreparedSpellIndices(Array.from(new Set(allAlwaysSpellIndices)));
    };

    const loadPreparedSpells = async () => {
        const preparedSpellsData: Spell[] = [];
        for (const spellIndex of alwaysPreparedSpellIndices) {
            try {
                const spellData = await fetchSpellByIndex(spellIndex);
                const alwaysRememberedIndices = getAlwaysRememberedSpells(character.id);
                preparedSpellsData.push({
                    ...spellData,
                    alwaysRemembered: alwaysRememberedIndices.includes(spellIndex)
                });
            } catch (error) {
                console.error(`Failed to fetch spell ${spellIndex}:`, error);
            }
        }
        setPreparedSpells(preparedSpellsData);
    };

    const loadCharacterSpells = async () => {
        const characterSpellIndices: string[] = Array.isArray(character.spellIndices)
            ? character.spellIndices
            : [];
        
        const characterSpellsData: Spell[] = [];
        for (const spellIndex of characterSpellIndices) {
            try {
                const spellData = await fetchSpellByIndex(spellIndex);
                characterSpellsData.push(spellData);
            } catch (error) {
                console.error(`Failed to fetch character spell ${spellIndex}:`, error);
            }
        }
        setCharacterSpells(characterSpellsData);
    };

    const loadKnownSpells = async () => {
        const knownSpellIndices: string[] = Array.isArray(character.knownSpellIndices)
            ? character.knownSpellIndices
            : [];
        
        const knownSpellsData: Spell[] = [];
        for (const spellIndex of knownSpellIndices) {
            try {
                const spellData = await fetchSpellByIndex(spellIndex);
                knownSpellsData.push(spellData);
            } catch (error) {
                console.error(`Failed to fetch known spell ${spellIndex}:`, error);
            }
        }
        setKnownSpells(knownSpellsData);
    };

    // Load always prepared spells when character changes
    useEffect(() => {
        loadAlwaysPreparedSpells();
    }, [character.level, character.class.name, character.class.subclass?.name, character.id]);

    // Load prepared spells when always prepared indices change
    useEffect(() => {
        if (alwaysPreparedSpellIndices.length > 0) {
            loadPreparedSpells();
        } else {
            setPreparedSpells([]);
        }
    }, [alwaysPreparedSpellIndices]);

    // Load character spells when character.spellIndices changes
    useEffect(() => {
        if (character.spellIndices && character.spellIndices.length > 0) {
            loadCharacterSpells();
        } else {
            setCharacterSpells([]);
        }
    }, [character.spellIndices]);

    // Load known spells when character.knownSpellIndices changes
    useEffect(() => {
        if (usesKnownSpells() && character.knownSpellIndices && character.knownSpellIndices.length > 0) {
            loadKnownSpells();
        } else {
            setKnownSpells([]);
        }
    }, [character.knownSpellIndices, character.class.name]);

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
        setCharacter((prev) => {
            const spellIndices: string[] = Array.isArray(prev.spellIndices)
                ? prev.spellIndices
                : [];
            return {
                ...prev,
                spellIndices: spellIndices.filter(
                    (s: string) => s !== spellIndex
                ),
            };
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
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [showSuggestions]);

    const characterSpellIndices: string[] = Array.isArray(character.spellIndices)
        ? character.spellIndices
        : [];

    return (
        <div>
            <h2>Spellbook</h2>
            <div style={{ marginBottom: 16 }}>
                <button
                    type="button"
                    className="spellbook-myspells-btn"
                    onClick={() => setShowCharacterSpells((v) => !v)}
                >
                    {showCharacterSpells ? "▼" : "►"} Prepared Spells (
                    {characterSpells.length})
                </button>
                {showCharacterSpells && (
                    <div style={{ marginTop: '8px' }}>
                        {characterSpells.length === 0 ? (
                            <div className="spellbook-myspells-empty" style={{ padding: '16px', fontStyle: 'italic', color: '#666' }}>
                                No spells added yet.
                            </div>
                        ) : (
                            /* Group character spells by level */
                            groupAndSortSpells(characterSpells) &&
                            Object.entries(groupAndSortSpells(characterSpells))
                                .sort(([a], [b]) => Number(a) - Number(b))
                                .map(([level, spells]) => (
                                    <Spelllist
                                        key={`char-${level}`}
                                        spellarray={spells}
                                        level={Number(level)}
                                        usedSlots={[]}
                                        onSlotToggle={() => {}}
                                        spellSlots={null}
                                        onRemoveSpell={handleRemoveCharacterSpell}
                                        onMoveToKnown={handleMovePreparedToKnown}
                                        onDeleteSpell={handleDeletePreparedSpell}
                                        usesKnownSpells={usesKnownSpells()}
                                    />
                                ))
                        )}
                    </div>
                )}
            </div>
            
            {/* Always Prepared Spells Section */}
            <div style={{ marginBottom: 16 }}>
                <button
                    type="button"
                    className="spellbook-myspells-btn"
                    onClick={() => setShowPreparedSpells((v) => !v)}
                    style={{ 
                        backgroundColor: '#e8f5e8', 
                        border: '1px solid #c8e6c9',
                        color: '#2e7d32'
                    }}
                >
                    {showPreparedSpells ? "▼" : "►"} ✓ Always Prepared Spells ({alwaysPreparedSpellIndices.length})
                </button>
                {showPreparedSpells && alwaysPreparedSpellIndices.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                        {/* Group spells by level */}
                        {Array.from(new Set(preparedSpells.map(spell => spell.level)))
                            .sort((a, b) => a - b)
                            .map(level => {
                                const spellsOfLevel = preparedSpells.filter(spell => spell.level === level);
                                return (
                                    <Spelllist
                                        key={level}
                                        spellarray={spellsOfLevel}
                                        level={level}
                                        usedSlots={[]}
                                        onSlotToggle={() => {}}
                                        spellSlots={null}
                                        usesKnownSpells={usesKnownSpells()}
                                    />
                                );
                            })}
                        {/* Show manually added always remembered spells with remove option */}
                        <div style={{ marginTop: '12px' }}>
                            <h5 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>Manually Added:</h5>
                            <ul className="spellbook-myspells-list">
                                {getAlwaysPreparedSpellNames()
                                    .filter(spellName => {
                                        const spell = allSpells.find(s => s.name === spellName);
                                        return spell && getAlwaysRememberedSpells(character.id).includes(spell.index);
                                    })
                                    .map((spellName) => {
                                        const spell = allSpells.find(s => s.name === spellName);
                                        return (
                                            <li
                                                key={`manual-${spell?.index}`}
                                                className="spellbook-myspells-listitem"
                                                style={{ backgroundColor: '#f9fff9' }}
                                            >
                                                <span>{spellName}</span>
                                                <button
                                                    type="button"
                                                    className="spellbook-myspells-remove-btn"
                                                    onClick={() => spell && handleRemoveAlwaysRemembered(spell.index)}
                                                    title="Remove from always remembered"
                                                    style={{ backgroundColor: '#ffebee', color: '#c62828' }}
                                                >
                                                    ✕
                                                </button>
                                            </li>
                                        );
                                    })}
                                {getAlwaysRememberedSpells(character.id).length === 0 && (
                                    <li className="spellbook-myspells-empty" style={{ fontStyle: 'italic', color: '#666' }}>
                                        No manually added spells.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Known Spells Section - Only for Wizard, Cleric, Druid */}
            {usesKnownSpells() && (
                <div style={{ marginBottom: 16 }}>
                    <button
                        type="button"
                        className="spellbook-myspells-btn"
                        onClick={() => setShowKnownSpells((v) => !v)}
                        style={{ 
                            backgroundColor: '#fff3e0', 
                            border: '1px solid #ffcc02',
                            color: '#f57c00'
                        }}
                    >
                        {showKnownSpells ? "▼" : "►"} 📜 Known Spells ({knownSpells.length})
                    </button>
                    {showKnownSpells && (
                        <div style={{ marginTop: '8px' }}>
                            {knownSpells.length === 0 ? (
                                <div className="spellbook-myspells-empty" style={{ padding: '16px', fontStyle: 'italic', color: '#666' }}>
                                    No known spells yet. Add spells using the search below.
                                </div>
                            ) : (
                                /* Group known spells by level */
                                groupAndSortSpells(knownSpells) &&
                                Object.entries(groupAndSortSpells(knownSpells))
                                    .sort(([a], [b]) => Number(a) - Number(b))
                                    .map(([level, spells]) => (
                                        <Spelllist
                                            key={`known-${level}`}
                                            spellarray={spells}
                                            level={Number(level)}
                                            usedSlots={[]}
                                            onSlotToggle={() => {}}
                                            spellSlots={null}
                                            onRemoveSpell={handleToggleKnownSpell}
                                            onMoveToPrepared={handleMoveToPrepared}
                                            usesKnownSpells={usesKnownSpells()}
                                        />
                                    ))
                            )}
                        </div>
                    )}
                </div>
            )}
            
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (filteredSuggestions.length > 0)
                        handleSelectSuggestion(filteredSuggestions[0]);
                }}
                className="spellbook-search-form"
                autoComplete="off"
            >
                <input
                    type="text"
                    placeholder="Search for a spell..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setShowSuggestions(e.target.value.length > 0);
                    }}
                    className="spellbook-search-input"
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            setShowSuggestions(false);
                        } else if (
                            e.key === "ArrowDown" &&
                            filteredSuggestions.length > 0
                        ) {
                            e.preventDefault();
                            // Focus first suggestion (could be enhanced further with keyboard navigation)
                        }
                    }}
                />
                <button type="submit" className="spellbook-search-btn">
                    Search
                </button>
                {showSuggestions && search.length > 0 && (
                    <ul ref={suggestionsRef} className="spellbook-suggestions">
                        {filteredSuggestions.length > 0 ? (
                            filteredSuggestions.map(
                                (s: { name: string; index: string }) => (
                                    <li
                                        key={s.index}
                                        className="spellbook-suggestion-item"
                                        onClick={() =>
                                            handleSelectSuggestion(s)
                                        }
                                    >
                                        {s.name}
                                    </li>
                                )
                            )
                        ) : (
                            <li
                                className="spellbook-suggestion-item"
                                style={{ fontStyle: "italic", color: "#666" }}
                            >
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="spellbook-spell-details-checkbox">
                                <input
                                    type="checkbox"
                                    checked={characterSpellIndices.includes(spell.index)}
                                    onChange={() =>
                                        handleToggleCharacterSpell(spell.index)
                                    }
                                />
                                Add to character spells
                            </label>
                            {usesKnownSpells() && (
                                <label className="spellbook-spell-details-checkbox" style={{ color: '#f57c00' }}>
                                    <input
                                        type="checkbox"
                                        checked={character.knownSpellIndices?.includes(spell.index) || false}
                                        onChange={() => handleToggleKnownSpell(spell.index)}
                                    />
                                    Add to known spells
                                </label>
                            )}
                            <label className="spellbook-spell-details-checkbox" style={{ color: '#2e7d32' }}>
                                <input
                                    type="checkbox"
                                    checked={isSpellAlwaysRemembered(character.id, spell.index)}
                                    onChange={() => handleAlwaysRememberedToggle(spell.index)}
                                />
                                Always remember this spell
                            </label>
                        </div>
                    </div>
                    <pre
                        style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {JSON.stringify(spell, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default Spellbook;
