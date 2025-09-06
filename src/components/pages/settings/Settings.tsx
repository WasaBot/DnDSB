import React, { useEffect, useState } from "react";
import { useSettings } from "../../../context/SettingsContext";
import "./settings.css";
import supabase from "../../../utils/supabase";
import { ClassNames } from "../../../utils/types/types";

const Settings: React.FC = () => {
  const { unit, setUnit, character, setCharacter } = useSettings();

  // Save/Load state
  const [importString, setImportString] = useState("");
  const [exportString, setExportString] = useState("");

  // Switch handler
  const handleUnitChange = () => {
    setUnit(unit === "ft" ? "m" : "ft");
  };

  // Character form handlers
  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "class") {
      // Fetch spellcasting attribute for the selected class
      try {
        const { data, error } = await supabase
          .from("classes")
          .select(
            `
           spellcast_attribute_id,
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
            class: { name: value, spellcastingAbility: undefined },
          }));
        } else {          
          const spellcastingAbility = (data as any).attributes?.name || null;
          setCharacter((prev) => ({
            ...prev,
            class: { name: value, spellcastingAbility },
          }));
        }
      } catch (err) {
        console.error("Error fetching class info:", err);
        setCharacter((prev) => ({
          ...prev,
          class: { name: value, spellcastingAbility: undefined },
        }));
      }
    } else {
      if (
        [
          "strength",
          "dexterity",
          "constitution",
          "intelligence",
          "wisdom",
          "charisma",
        ].includes(name)
      ) {
        // Update attribute
        setCharacter((prev) => ({
          ...prev,
          attributes: {
            ...prev.attributes,
            [name]: Number(value),
          },
        }));
      } else {
        // Update other character properties
        setCharacter((prev) => ({
          ...prev,
          [name]: name === "level" ? Number(value) : value,
        }));
      }
    }
  };

  // --- Save/Load Feature ---
  // Export character info, spell list, and usedSlots as a string
  const handleExport = () => {
    // Try to get usedSlots from localStorage if present
    let usedSlots: any = undefined;
    try {
      const slots = localStorage.getItem("usedSlots");
      if (slots) usedSlots = JSON.parse(slots);
    } catch {}
    const data = {
      character,
      usedSlots,
    };
    setExportString(btoa(unescape(encodeURIComponent(JSON.stringify(data)))));
  };

  // Import character info, spell list, and usedSlots from a string
  const handleImport = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(importString.trim())));
      const data = JSON.parse(decoded);
      if (data.character) setCharacter(data.character);
      if (data.usedSlots) {
        try {
          localStorage.setItem("usedSlots", JSON.stringify(data.usedSlots));
        } catch {}
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
            onChange={handleChange}
          />
        </label>
        <label>
          Class:
          <select
            name="class"
            value={character.class.name ?? ""}
            onChange={handleChange}
          >
            {ClassNames.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </label>
        {character.class.spellcastingAbility && (
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            Spellcasting Ability:{" "}
            {character.class.spellcastingAbility.charAt(0).toUpperCase() +
              character.class.spellcastingAbility.slice(1)}
          </div>
        )}
        <label>
          Level:
          <input
            name="level"
            type="number"
            min={1}
            max={20}
            value={character.level ?? 1}
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            style={{ width: "100%", minHeight: 40, marginBottom: 8 }}
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
