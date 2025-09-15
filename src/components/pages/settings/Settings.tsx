import React, { useState, useEffect } from "react";
import { useSettings } from "../../../context/SettingsContext";
import "./settings.css";
import supabase from "../../../utils/supabase";
import {
    ClassNames,
    type AttributeName,
    type Subclass,
} from "../../../utils/types/types";

const Settings: React.FC = () => {
    const { unit, setUnit, character, setCharacter } = useSettings();

    // Save/Load state
    const [importString, setImportString] = useState("");
    const [exportString, setExportString] = useState("");

    // Subclass state
    const [availableSubclasses, setAvailableSubclasses] = useState<Subclass[]>(
        []
    );
    const [subclassLevelReq, setSubclassLevelReq] = useState<number>(3);

    // Switch handler
    const handleUnitChange = () => {
        setUnit(unit === "ft" ? "m" : "ft");
    };

    // Character form handlers
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCharacter((prev) => ({
            ...prev,
            name: e.target.value,
        }));
    };

    const handleClassChange = async (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const value = e.target.value;
        try {
            const { data, error } = await supabase
                .from("classes")
                .select(
                    `
         spellcast_attribute_id,
         subclass_from_lvl,
         attributes (
           id,
           name
         )`
                )
                .eq("class_name", value)
                .single();
            if (error) {
                console.error("Error fetching class info:", error);
                setCharacter((prev) => ({
                    ...prev,
                    class: {
                        name: value,
                        spellcastingAbility: undefined,
                        subclass: undefined,
                    },
                }));
                setAvailableSubclasses([]);
                setSubclassLevelReq(3);
            } else {
                const spellcastingAbility =
                    (data as any).attributes?.name || null;
                const subclassLevel = (data as any).subclass_from_lvl || null;

                setSubclassLevelReq(subclassLevel);
                setCharacter((prev) => ({
                    ...prev,
                    class: {
                        name: value,
                        spellcastingAbility,
                        subclass: undefined,
                    },
                }));

                const { data: subclassData, error: subclassError } =
                    await supabase
                        .from("subclasses")
                        .select(
                            "index,subclass,spellcasting_attribute_id,attributes (id,name)"
                        )
                        .eq("base_class", value.toLowerCase());

                if (!subclassError && subclassData) {
                    const subClassData = subclassData.map((sub: any) => ({
                        id: sub.index,
                        name: sub.subclass,
                        spellcastingAbility:
                            sub.attributes !== null
                                ? sub.attributes.name
                                : null,
                    }));
                    setAvailableSubclasses(subClassData);
                } else {
                    setAvailableSubclasses([]);
                }
            }
        } catch (err) {
            console.error("Error fetching class info:", err);
            setCharacter((prev) => ({
                ...prev,
                class: {
                    name: value,
                    spellcastingAbility: undefined,
                    subclass: undefined,
                },
            }));
            setAvailableSubclasses([]);
            setSubclassLevelReq(3);
        }
    };

    const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLevel = Number(e.target.value);
        setCharacter((prev) => ({
            ...prev,
            level: newLevel,
        }));
    };

    // Effect to load subclasses when component mounts or class changes
    useEffect(() => {
        const loadSubclasses = async () => {
            if (!character.class.name) return;

            try {
                const { data, error } = await supabase
                    .from("classes")
                    .select("subclass_from_lvl")
                    .eq("class_name", character.class.name)
                    .single();

                if (!error && data) {
                    setSubclassLevelReq(data.subclass_from_lvl || 3);

                    const { data: subclassData, error: subclassError } =
                        await supabase
                            .from("subclasses")
                            .select(
                                "index,subclass,spellcasting_attribute_id,attributes (id,name)"
                            )
                            .eq(
                                "base_class",
                                character.class.name.toLowerCase()
                            );

                    if (!subclassError && subclassData) {
                        const subClassData = subclassData.map((sub: any) => ({
                            id: sub.index,
                            name: sub.subclass,
                            spellcastingAbility:
                                sub.attributes !== null
                                    ? sub.attributes.name
                                    : null,
                        }));
                        setAvailableSubclasses(subClassData);
                    }
                }
            } catch (err) {
                console.error("Error loading subclasses:", err);
            }
        };

        loadSubclasses();
    }, [character.class.name]);

    // Effect to clear subclass if level becomes too low
    useEffect(() => {
        if (character.level < subclassLevelReq) {
            setCharacter((prev) => ({
                ...prev,
                class: {
                    ...prev.class,
                    subclass: undefined,
                },
            }));
        }
    }, [character.level, subclassLevelReq, character.class.subclass]);

    const handleAttributeChange =
        (attributeName: AttributeName) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setCharacter((prev) => ({
                ...prev,
                attributes: {
                    ...prev.attributes,
                    [attributeName]: Number(e.target.value),
                },
            }));
        };

    const handleSubclassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || undefined;
        const selectedSubclass = value
            ? availableSubclasses.find((sub) => sub.id === value)
            : undefined;
        setCharacter((prev) => ({
            ...prev,
            class: {
                ...prev.class,
                subclass: selectedSubclass
                    ? availableSubclasses.find((sub) => sub.id === value)
                    : undefined,
                spellcastingAbility:
                    availableSubclasses.find((sub) => sub.id === value)
                        ?.spellcastingAbility || prev.class.spellcastingAbility,
            },
        }));
    };

    // --- Save/Load Feature ---
    // Export character info, spell list, and usedSlots as a string
    const handleExport = () => {
        // Try to get usedSlots from localStorage if present
        let usedSlots: any = undefined;
        let usedResources: any = undefined;
        try {
            const slots = localStorage.getItem(`usedSlots_${character.id}`);
            if (slots) usedSlots = JSON.parse(slots);
            const resources = localStorage.getItem(`resources_${character.id}`);
            if (resources) usedResources = JSON.parse(resources);
        } catch {}
        const data = {
            character,
            usedSlots,
            usedResources,
        };
        setExportString(
            window.btoa(decodeURI(encodeURIComponent(JSON.stringify(data))))
        );
    };

    // Import character info, spell list, and usedSlots from a string
    const handleImport = () => {
        try {
            const decoded = decodeURIComponent(
                decodeURI(window.atob(importString.trim()))
            );
            const data = JSON.parse(decoded);
            if (data.character) {
                setCharacter(data.character);
                // Use the imported character's ID for storing the resources
                const characterId = data.character.id;
                if (data.usedSlots) {
                    try {
                        localStorage.setItem(
                            `usedSlots_${characterId}`,
                            JSON.stringify(data.usedSlots)
                        );
                    } catch {}
                }
                if (data.usedResources) {
                    try {
                        localStorage.setItem(
                            `resources_${characterId}`,
                            JSON.stringify(data.usedResources)
                        );
                    } catch {}
                }
            }
            alert("Character loaded!");
        } catch {
            alert("Invalid import string!");
        }
    };

    return (
        <div>
            <h2>Settings</h2>
            <div className="switch-row">
                <span>Use meters (m)</span>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={unit === "ft"}
                        onChange={handleUnitChange}
                    />
                    <span className="slider"></span>
                </label>
                <span>Use feet (ft)</span>
            </div>
            <h3>Character</h3>
            <form className="character-form">
                <label>
                    Name:
                    <input
                        name="name"
                        value={character.name ?? ""}
                        onChange={handleNameChange}
                    />
                </label>
                <label>
                    Class:
                    <select
                        name="class"
                        value={character.class.name ?? ""}
                        onChange={handleClassChange}
                    >
                        {ClassNames.map((cls) => (
                            <option key={cls} value={cls}>
                                {cls}
                            </option>
                        ))}
                    </select>
                </label>
                {(character.level >= subclassLevelReq ||
                    character.class.subclass !== undefined) && (
                    <label>
                        Subclass:
                        <select
                            name="subclass"
                            value={character.class.subclass?.id ?? ""}
                            onChange={handleSubclassChange}
                        >
                            <option value="">Select Subclass</option>
                            {availableSubclasses.map((subclass) => (
                                <option key={subclass.id} value={subclass.id}>
                                    {subclass.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <label>
                    Level:
                    <input
                        name="level"
                        type="number"
                        min={1}
                        max={20}
                        value={character.level ?? 1}
                        onChange={handleLevelChange}
                    />
                </label>
                <label>
                    Strength:
                    <input
                        name="strength"
                        type="number"
                        min={1}
                        max={20}
                        value={character.attributes.Strength ?? 10}
                        onChange={handleAttributeChange("Strength")}
                    />
                </label>
                <label>
                    Dexterity:
                    <input
                        name="dexterity"
                        type="number"
                        min={1}
                        max={20}
                        value={character.attributes.Dexterity ?? 10}
                        onChange={handleAttributeChange("Dexterity")}
                    />
                </label>
                <label>
                    Constitution:
                    <input
                        name="constitution"
                        type="number"
                        min={1}
                        max={20}
                        value={character.attributes.Constitution ?? 10}
                        onChange={handleAttributeChange("Constitution")}
                    />
                </label>
                <label>
                    Intelligence:
                    <input
                        name="intelligence"
                        type="number"
                        min={1}
                        max={20}
                        value={character.attributes.Intelligence ?? 10}
                        onChange={handleAttributeChange("Intelligence")}
                    />
                </label>
                <label>
                    Wisdom:
                    <input
                        name="wisdom"
                        type="number"
                        min={1}
                        max={20}
                        value={character.attributes.Wisdom ?? 10}
                        onChange={handleAttributeChange("Wisdom")}
                    />
                </label>
                <label>
                    Charisma:
                    <input
                        name="charisma"
                        type="number"
                        min={1}
                        max={20}
                        value={character.attributes.Charisma ?? 10}
                        onChange={handleAttributeChange("Charisma")}
                    />
                </label>
            </form>
            {/* Save/Load Feature */}
            <div style={{ marginTop: 24 }}>
                <h4>Save/Load Character</h4>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <button
                        type="button"
                        className="charactersheet-rest-btn"
                        onClick={handleExport}
                    >
                        Export
                    </button>
                    <button
                        type="button"
                        className="charactersheet-rest-btn"
                        onClick={handleImport}
                    >
                        Import
                    </button>
                </div>
                <div>
                    <textarea
                        style={{
                            width: "100%",
                            minHeight: 40,
                            marginBottom: 8,
                        }}
                        placeholder="Exported character string will appear here"
                        value={exportString}
                        readOnly
                        onFocus={(e) => e.target.select()}
                    />
                    <textarea
                        style={{ width: "100%", minHeight: 40 }}
                        placeholder="Paste character string here to import"
                        value={importString}
                        onChange={(e) => setImportString(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default Settings;
