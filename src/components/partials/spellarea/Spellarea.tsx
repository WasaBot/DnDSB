import React, { useEffect, useState } from "react";
import { useSettings } from "../../../context/SettingsContext";
import { useResources } from "../../../context/ResourcesContext";
import Spelllist from "../spelllist/Spelllist";
import { groupAndSortSpells, getAlwaysPreparedSpells, getAlwaysRememberedSpells } from "../../../utils/functions";
import { fetchSpellsByIndices, fetchSpellslots } from "../../../utils/dbFuncs";

const Spellarea: React.FC = () => {
    const { character } = useSettings();
    const { resetTrigger } = useResources();
    const [dbSpellDetails, setDbSpellDetails] = useState<Record<string, any>>(
        {}
    );
    const [alwaysPreparedSpells, setAlwaysPreparedSpells] = useState<Record<string, any>>({});
    const [spellSlots, setSpellSlots] = useState<number[] | null>(null);
    const [usedSlots, setUsedSlots] = useState<Record<number, boolean[]>>(
        () => {
            try {
                const saved = localStorage.getItem(`usedSlots_${character.id}`);
                return saved ? JSON.parse(saved) : {};
            } catch {
                return {};
            }
        }
    );
    const characterSpellIndices: string[] = character.spellIndices || [];

    // Fetch spell details when spell indices change
    useEffect(() => {
        const loadSpellDetails = async () => {
            // Load character's chosen spells
            if (characterSpellIndices.length > 0) {
                const spellDetails = await fetchSpellsByIndices(
                    characterSpellIndices
                );
                setDbSpellDetails(spellDetails);
            } else {
                setDbSpellDetails({});
            }
            
            // Load always prepared spells
            const alwaysPreparedIndices = await getAlwaysPreparedSpells(character);
            const alwaysRememberedIndices = getAlwaysRememberedSpells(character.id);
            const allAlwaysSpellIndices = [...alwaysPreparedIndices, ...alwaysRememberedIndices];
            
            if (allAlwaysSpellIndices.length > 0) {
                const alwaysSpellDetails = await fetchSpellsByIndices(allAlwaysSpellIndices);
                // Mark these spells as always prepared
                Object.keys(alwaysSpellDetails).forEach(index => {
                    alwaysSpellDetails[index].alwaysRemembered = alwaysRememberedIndices.includes(index);
                });
                setAlwaysPreparedSpells(alwaysSpellDetails);
            } else {
                setAlwaysPreparedSpells({});
            }
        };
        loadSpellDetails();
    }, [character.level, character.class.name, character.class.subclass?.name, character.id]);

    // Fetch spell slots
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

    const filteredCharacterSpells = characterSpellIndices
        .map((index) => dbSpellDetails[index])
        .filter((s: any) => s && typeof s.level === "number");
    
    // Add always prepared spells
    const filteredAlwaysPreparedSpells = Object.values(alwaysPreparedSpells)
        .filter((s: any) => s && typeof s.level === "number");
    
    // Combine all spells and remove duplicates
    const allSpells = [...filteredCharacterSpells, ...filteredAlwaysPreparedSpells];
    const uniqueSpells = allSpells.reduce((acc: any[], spell) => {
        if (!acc.find(s => s.index === spell.index)) {
            acc.push(spell);
        }
        return acc;
    }, []);
    
    const groupedSpells = groupAndSortSpells(uniqueSpells);

    // Create all spell levels (0-9) with spells if available, empty arrays if not
    const allSpellLevels = Array.from({ length: 10 }, (_, i) => ({
        level: i,
        spells: groupedSpells[i] || [],
    }));
    const [usedResources, setUsedResources] = useState<number>(() => {
        try {
            const saved = localStorage.getItem(`resources_${character.id}`);
            return saved ? JSON.parse(saved) : 0;
        } catch {
            return 0;
        }
    });

    // Save used slots when they change
    useEffect(() => {
        try {
            localStorage.setItem(
                `usedSlots_${character.id}`,
                JSON.stringify(usedSlots)
            );
        } catch {}
    }, [usedSlots, character.id]);

    // Save used resources when they change
    useEffect(() => {
        try {
            localStorage.setItem(
                `resources_${character.id}`,
                JSON.stringify(usedResources)
            );
        } catch {}
    }, [usedResources, character.id]);

    // Load character-specific resources when character ID changes
    useEffect(() => {
        try {
            const savedSlots = localStorage.getItem(
                `usedSlots_${character.id}`
            );
            const savedResources = localStorage.getItem(
                `resources_${character.id}`
            );

            if (savedSlots) {
                setUsedSlots(JSON.parse(savedSlots));
            } else {
                setUsedSlots({});
            }

            if (savedResources) {
                setUsedResources(JSON.parse(savedResources));
            } else {
                setUsedResources(0);
            }
        } catch {
            setUsedSlots({});
            setUsedResources(0);
        }
    }, [character.id]);

    // Reset spell slots when rest is triggered
    useEffect(() => {
        if (resetTrigger > 0) {
            setUsedSlots({});
            setUsedResources(0);
        }
    }, [resetTrigger]);

    // Spell slot checkbox toggle handler
    const handleSlotToggle = (level: number, idx: number) => {
        setUsedSlots((prev) => {
            const slotsForLevel =
                level === 0 ? 0 : spellSlots?.[level - 1] || 0;
            const arr =
                prev[level] && prev[level].length === slotsForLevel
                    ? [...prev[level]]
                    : Array(slotsForLevel).fill(false);
            arr[idx] = !arr[idx];
            return { ...prev, [level]: arr };
        });
    };

    //setUsedResources(0); //TODO: richtig machen

    return (
        <>
            {character.class.spellcastingAbility && (
                <div>
                    <div className="charactersheet-spell-section">
                        <h4>Available Spells</h4>
                        {allSpellLevels.map(
                            ({ level, spells }) =>
                                (level == 0 ||
                                    (spellSlots?.[level - 1] !== undefined &&
                                        spellSlots[level - 1] > 0)) && (
                                    <div key={level}>
                                        <Spelllist
                                            level={level}
                                            spellarray={spells}
                                            usedSlots={usedSlots[level] || []}
                                            onSlotToggle={(idx: number) =>
                                                handleSlotToggle(level, idx)
                                            }
                                            spellSlots={spellSlots}
                                        />
                                    </div>
                                )
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Spellarea;
