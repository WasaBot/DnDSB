import React, { useEffect, useState } from "react";
import { useSettings } from "../../../context/SettingsContext";
import "./settings.css";
import supabase from "../../../utils/supabase";

const Settings: React.FC = () => {
  const { unit, setUnit, character, setCharacter } = useSettings();
  const [classes, setClasses] = useState<any>(['']);

  useEffect(() => {
    const fetchRes = async () => {
      const { data: classes, error } = await supabase
      .from('classes')
      .select('class_name');
      
      if (error) {
        console.error('Error fetching classes:', error);
        return;
      }
            
      if (classes && classes.length > 0) {
        setClasses(classes);
      }
    };

    fetchRes().then((v) => console.log(JSON.stringify(v,null,2)));
  }, []);

  // Save/Load state
  const [importString, setImportString] = useState("");
  const [exportString, setExportString] = useState("");

  // Switch handler
  const handleUnitChange = () => {
    setUnit(unit === "ft" ? "m" : "ft");
  };

  // Character form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCharacter(prev => ({
      ...prev,
      [name]: name === "level" || ["strength","dexterity","constitution","intelligence","wisdom","charisma"].includes(name)
        ? Number(value)
        : value
    }));
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
            checked={unit === "m"}
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
          <input name="name" value={character.name} onChange={handleChange} />
        </label>
        <label>
          Class:
          
          <select name="class" value={character.class} onChange={handleChange}>
            {classes.map((cls:{class_name: string}) => (
              <option key={cls.class_name} value={cls.class_name}>{cls.class_name}</option>
            ))}
          </select>
        </label>
        <label>
          Level:
          <input name="level" type="number" min={1} max={20} value={character.level} onChange={handleChange} />
        </label>
        <label>
          Strength:
          <input name="strength" type="number" min={1} max={20} value={character.strength} onChange={handleChange} />
        </label>
        <label>
          Dexterity:
          <input name="dexterity" type="number" min={1} max={20} value={character.dexterity} onChange={handleChange} />
        </label>
        <label>
          Constitution:
          <input name="constitution" type="number" min={1} max={20} value={character.constitution} onChange={handleChange} />
        </label>
        <label>
          Intelligence:
          <input name="intelligence" type="number" min={1} max={20} value={character.intelligence} onChange={handleChange} />
        </label>
        <label>
          Wisdom:
          <input name="wisdom" type="number" min={1} max={20} value={character.wisdom} onChange={handleChange} />
        </label>
        <label>
          Charisma:
          <input name="charisma" type="number" min={1} max={20} value={character.charisma} onChange={handleChange} />
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
            onFocus={e => e.target.select()}
          />
          <textarea
            style={{ width: "100%", minHeight: 40 }}
            placeholder="Paste character string here to import"
            value={importString}
            onChange={e => setImportString(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;