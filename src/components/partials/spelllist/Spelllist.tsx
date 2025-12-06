import { useState } from "react";
import type { Spell } from "../../../utils/types/types";
import SpellItem from "../spellitem/SpellItem";

interface SpelllistProps {
  spellarray: Spell[];
  level: number;
  usedSlots: boolean[];
  onSlotToggle: (idx: number) => void;
  spellSlots: number[] | null;
  onRemoveSpell?: (spellIndex: string, spellName: string) => void;
  onMoveToPrepared?: (spellIndex: string, spellName: string) => void;
  onMoveToKnown?: (spellIndex: string, spellName: string) => void;
  usesKnownSpells?: boolean;
}

const Spelllist: React.FC<SpelllistProps> = ({
    spellarray,
    level,
    usedSlots,
    onSlotToggle,
    spellSlots,
    onRemoveSpell,
    onMoveToPrepared,
    onMoveToKnown,
    usesKnownSpells = false,
}) => {
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
                    {spellarray.map((spell: Spell & { Prepared?: boolean }) => (
                        <SpellItem
                            key={spell.name}
                            spell={spell}
                            onRemoveSpell={onRemoveSpell}
                            onMoveToPrepared={onMoveToPrepared}
                            onMoveToKnown={onMoveToKnown}
                            usesKnownSpells={usesKnownSpells}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Spelllist;
