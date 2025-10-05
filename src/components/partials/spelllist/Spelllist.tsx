import { useState } from "react";
import type { Spell } from "../../../utils/types/types";

interface SpelllistProps {
  spellarray: Spell[];
  level: number;
  usedSlots: boolean[];
  onSlotToggle: (idx: number) => void;
  spellSlots: number[] | null;
  onRemoveSpell?: (spellIndex: string, spellName: string) => void;
}

const Spelllist: React.FC<SpelllistProps> = ({
    spellarray,
    level,
    usedSlots,
    onSlotToggle,
    spellSlots,
    onRemoveSpell,
}) => {
    const [openSpell, setOpenSpell] = useState<string | null>(null);
    const [openLevel, setOpenLevel] = useState<boolean>(false);

    return (
        <div style={{ marginBottom: 10, width: "100%" }}>
            <button
                type="button"
                className="charactersheet-spelllevel-btn"
                onClick={() => setOpenLevel(!openLevel)}
            >
                {openLevel ? "▼" : "►"}{" "}
                {level === 0 ? "Cantrips" : `Level ${level}`}{" "}
            </button>
            <span className="charactersheet-spelllevel-checkboxes">
                {spellSlots?.[level - 1]
                    ? Array.from({ length: spellSlots[level - 1] }).map(
                          (_, idx) => (
                              <label key={idx}>
                                  <input
                                      type="checkbox"
                                      checked={usedSlots?.[idx] || false}
                                      onChange={() => onSlotToggle(idx)}
                                  />
                              </label>
                          )
                      )
                    : null}
            </span>
            {openLevel && (
                <ul className="charactersheet-spell-list">
                    {spellarray.map((spell: any) => (
                        <li
                            key={spell.name}
                            className="charactersheet-spell-listitem"
                        >
                            <div
                                className="charactersheet-spell-row"
                                onClick={() =>
                                    setOpenSpell(
                                        openSpell === spell.name
                                            ? null
                                            : spell.name
                                    )
                                }
                            >
                                <span>
                                    <b>{spell.name}</b> | {spell.castingTime} |{" "}
                                    {spell.range} | {spell.components} |{" "}
                                    {spell.duration}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {onRemoveSpell && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveSpell(spell.index, spell.name);
                                            }}
                                            style={{
                                                background: '#ffebee',
                                                border: '1px solid #e57373',
                                                borderRadius: '4px',
                                                color: '#c62828',
                                                padding: '2px 6px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}
                                            title="Remove spell"
                                        >
                                            ✕
                                        </button>
                                    )}
                                    <span>
                                        {openSpell === spell.name ? "▲" : "▼"}
                                    </span>
                                </div>
                            </div>
                            {openSpell === spell.name && (
                                <div className="charactersheet-spell-details">
                                    <i>{spell.description}</i>
                                    {spell.alwaysRemembered && (
                                        <div
                                            style={{
                                                marginTop: "8px",
                                                padding: "4px 8px",
                                                backgroundColor: "#e8f5e8",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                color: "#2e7d32",
                                            }}
                                        >
                                            ✓ Always Prepared
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Spelllist;
