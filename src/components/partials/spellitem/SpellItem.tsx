import { useState, useEffect } from "react";
import type { Spell } from "../../../utils/types/types";
import { mapDamageTypeIcons } from "../../../utils/functions";
import { fetchSpellAdditionalDesc, fetchDmgCharLvl, fetchSpellAtSlot } from "../../../utils/dbFuncs";
import { useSettings } from "../../../context/SettingsContext";
import SpellTable from "../spelltable/SpellTable";

interface SpellItemProps {
    spell: Spell & { Prepared?: boolean };
    onRemoveSpell?: (spellIndex: string, spellName: string) => void;
    onMoveToPrepared?: (spellIndex: string, spellName: string) => void;
    onMoveToKnown?: (spellIndex: string, spellName: string) => void;
    usesKnownSpells?: boolean;
}

const SpellItem: React.FC<SpellItemProps> = ({
    spell,
    onRemoveSpell,
    onMoveToPrepared,
    onMoveToKnown,
    usesKnownSpells = false,
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [additionalDesc, setAdditionalDesc] = useState<string[] | null>(null);
    const [damageAtCharLevel, setDamageAtCharLevel] = useState<any | null>(null);
    const [damageAtSpellLevel, setDamageAtSpellLevel] = useState<{[key: number]: string} | null>(null);
    const [healingAtSpellLevel, setHealingAtSpellLevel] = useState<{[key: number]: string} | null>(null);
    const { character } = useSettings();

    const renderFormattedText = (text: string) => {
        const parts = text.split(/(\*\*\*.*?\*\*\*)/g);
        
        return parts.map((part, index) => {
            if (part.startsWith('***') && part.endsWith('***')) {
                const boldText = part.slice(3, -3);
                return <b key={index}>{boldText}</b>;
            }
            return part;
        });
    };
    
    const renderAdditionalDescriptions = (descriptions: string[]) => {
        const hasListItems = descriptions.some(desc => desc.trim().startsWith('-'));
        
        if (hasListItems) {
            return (
                <ul style={{ marginTop: "4px", paddingLeft: "20px" }}>
                    {descriptions.map((desc, index) => {
                        const cleanDesc = desc.trim().startsWith('-') 
                            ? desc.trim().substring(1).trim() 
                            : desc.trim();
                        return (
                            <li key={index} style={{ marginBottom: "4px" }}>
                                {renderFormattedText(cleanDesc)}
                            </li>
                        );
                    })}
                </ul>
            );
        } else {
            return (
                <div>
                    {descriptions.map((desc, index) => (
                        <p key={index} style={{ marginTop: "4px", marginBottom: "4px" }}>
                            {renderFormattedText(desc)}
                        </p>
                    ))}
                </div>
            );
        }
    };

    const renderSpellInfo = () => {
        const infoItems = [];

        infoItems.push(<b key="name">{spell.name}</b>);

        if (spell.school) {
            infoItems.push(spell.school.charAt(0).toLocaleUpperCase() + spell.school.slice(1));
        }

        if (spell.castingTime) {
            infoItems.push(spell.castingTime);
        }

        if (spell.range) {
            infoItems.push(spell.range);
        }

        if (spell.duration) {
            const durationText = spell.concentration ? `Con, ${spell.duration}` : spell.duration;
            infoItems.push(durationText);
        }

        const attackOrSave = renderAttackTypeOrSaveDC();
        if (attackOrSave) {
            infoItems.push(attackOrSave);
        }

        const damageOrHeal = renderDamageOrHeal();
        if (damageOrHeal) {
            infoItems.push(damageOrHeal);
        }

        return infoItems.map((item, index) => (
            <span key={index}>
                {item}
                {index < infoItems.length - 1 && " | "}
            </span>
        ));
    };

    const renderAttackTypeOrSaveDC = () => {
        if (spell.attackType && spell.attackType !== '') {
            return spell.attackType.charAt(0).toLocaleUpperCase() + spell.attackType.slice(1);
        } else if (spell.spellSaveDcType) {
            return 'DC: ' + spell.spellSaveDcType.charAt(0).toLocaleUpperCase() + spell.spellSaveDcType.slice(1);
        }
        return '';
    };

    const renderUpcastingInfo = () => {
        const upcastingElements = [];

        if (spell.dmgAtHigherSlot && damageAtSpellLevel) {
            const damageEntries = [];
            const minLevel = spell.level;
            
            for (let level = minLevel; level <= 9; level++) {
                if (damageAtSpellLevel[level] && damageAtSpellLevel[level] !== null) {
                    damageEntries.push(`${level}: ${damageAtSpellLevel[level]}`);
                }
            }
            
            if (damageEntries.length > 1) {
                upcastingElements.push(
                    <div key="damage-upcasting" style={{ marginTop: "8px" }}>
                        Damage at Higher Levels:
                        <div style={{ marginLeft: "16px", fontFamily: "monospace", fontSize: "0.9em" }}>
                            {damageEntries.join(' | ')}
                        </div>
                    </div>
                );
            }
        }

        if (spell.healAtHigherSlot && healingAtSpellLevel) {
            const healingEntries = [];
            const minLevel = spell.level;
            
            for (let level = minLevel; level <= 9; level++) {
                if (healingAtSpellLevel[level] && healingAtSpellLevel[level] !== null) {
                    healingEntries.push(`${level}: ${healingAtSpellLevel[level]}`);
                }
            }
            
            if (healingEntries.length > 1) {
                upcastingElements.push(
                    <div key="healing-upcasting" style={{ marginTop: "8px" }}>
                        Healing at Higher Levels:
                        <div style={{ marginLeft: "16px", fontFamily: "monospace", fontSize: "0.9em" }}>
                            {healingEntries.join(' | ')}
                        </div>
                    </div>
                );
            }
        }

        return upcastingElements.length > 0 ? upcastingElements : null;
    };

    const renderDamageOrHeal = () => {        
        if (spell.damageType) {
            const icon = mapDamageTypeIcons(spell.damageType);
            let damageText = "";
            
            if (spell.dmgAtCharLvl && damageAtCharLevel) {
                const characterLevel = character.level;
                if (characterLevel >= 17 && damageAtCharLevel["17"]) {
                    damageText = damageAtCharLevel["17"];
                } else if (characterLevel >= 11 && damageAtCharLevel["11"]) {
                    damageText = damageAtCharLevel["11"];
                } else if (characterLevel >= 5 && damageAtCharLevel["5"]) {
                    damageText = damageAtCharLevel["5"];
                } else if (damageAtCharLevel["1"]) {
                    damageText = damageAtCharLevel["1"];
                }
            }
            else if (spell.dmgAtHigherSlot && damageAtSpellLevel) {
                const spellLevel = spell.level;
                if (damageAtSpellLevel[spellLevel]) {
                    damageText = damageAtSpellLevel[spellLevel];
                }
            }
            
            return (
                <span>
                    {icon} {damageText && <span>{damageText}</span>}
                </span>
            );
        } else if (spell.healAtHigherSlot) {
            const icon = mapDamageTypeIcons('healing');
            let healText = "";
            
            if (healingAtSpellLevel) {
                const spellLevel = spell.level;
                if (healingAtSpellLevel[spellLevel]) {
                    healText = healingAtSpellLevel[spellLevel];
                }
            }
            
            return (
                <span>
                    {icon} {healText && <span>{healText}</span>}
                </span>
            );
        }
        return null;
    };

    useEffect(() => {
        const fetchAdditionalDescription = async () => {
            if (spell.additionalDesc) {
                try {
                    const data = await fetchSpellAdditionalDesc(spell.index);
                    setAdditionalDesc(data);
                } catch (error) {
                    console.error('Error fetching additional description:', error);
                    setAdditionalDesc(null);
                }
            } else {
                setAdditionalDesc(null);
            }
        };

        fetchAdditionalDescription();
    }, [spell.index, spell.additionalDesc]);

    useEffect(() => {
        const fetchDamageAndHealing = async () => {
            try {
                if (spell.dmgAtCharLvl) {
                    const charLevelData = await fetchDmgCharLvl(spell.index);
                    setDamageAtCharLevel(charLevelData);
                }

                if (spell.dmgAtHigherSlot) {
                    const spellLevelData = await fetchSpellAtSlot(spell.index, 'dmg');
                    setDamageAtSpellLevel(spellLevelData);
                }

                if (spell.healAtHigherSlot) {
                    const healingData = await fetchSpellAtSlot(spell.index, 'heal');
                    setHealingAtSpellLevel(healingData);
                }
            } catch (error) {
                console.error('Error fetching damage/healing data:', error);
            }
        };

        fetchDamageAndHealing();
    }, [spell.index, spell.dmgAtCharLvl, spell.dmgAtHigherSlot, spell.healAtHigherSlot]);

    return (
        <li className="charactersheet-spell-listitem">
            <div
                className="charactersheet-spell-row"
                onClick={() => setIsOpen(!isOpen)}
            >
                {renderSpellInfo()}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {onMoveToPrepared && usesKnownSpells && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveToPrepared(spell.index, spell.name);
                            }}
                            style={{
                                background: '#e8f5e8',
                                border: '1px solid #c8e6c9',
                                borderRadius: '4px',
                                color: '#2e7d32',
                                padding: '2px 6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                            title="Move to always prepared"
                        >
                            → Prepare
                        </button>
                    )}
                    {onMoveToKnown && usesKnownSpells && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveToKnown(spell.index, spell.name);
                            }}
                            style={{
                                background: '#fff3e0',
                                border: '1px solid #ffcc02',
                                borderRadius: '4px',
                                color: '#f57c00',
                                padding: '2px 6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                            title="Move back to known spells"
                        >
                            ← To Known
                        </button>
                    )}
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
                        {isOpen ? "▲" : "▼"}
                    </span>
                </div>
            </div>
            {isOpen && (
                <div className="charactersheet-spell-details">
                    {spell.components} | {spell.material && `Material: ${spell.material}`}<br />
                    <i>{spell.desc}</i>
                    {spell.additionalDesc && additionalDesc && (
                        <div style={{ marginTop: "8px" }}>
                            {renderAdditionalDescriptions(additionalDesc)}
                        </div>
                    )}
                    {spell.dcDesc ?? ""}
                    <SpellTable 
                        spellIndex={spell.index}
                        hasTable={spell.hasTable}
                    />
                    {renderUpcastingInfo()}
                    </div>
            )}
        </li>
    );
};

export default SpellItem;