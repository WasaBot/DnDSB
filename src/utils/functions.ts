import type { Spell, Character } from "./types/types";
import {
    fetchClassPreparedSpells,
    fetchSubclassPreparedSpells,
} from "./dbFuncs";
import { TbCone2, TbSphere } from "react-icons/tb";
import {
    GiArrowhead,
    GiBrain,
    GiCube,
    GiDeathSkull,
    GiFire,
    GiHammerDrop,
    GiLightningBranches,
    GiNuclear,
    GiPoisonBottle,
    GiQuickSlash,
    GiSpeaker,
    GiSunbeams,
    GiTensionSnowflake,
    GiWindHole,
} from "react-icons/gi";
import { PiCylinder } from "react-icons/pi";
import React from "react";

export type ResourceType = "once" | "proficiency" | "lvl" | "attribute";

export interface ResourceInfo {
    resourceIndex: string;
    type: ResourceType;
    level: number;
    resetsOn: "short" | "short-long" | "long";
}

/**
 * Calculate the number of resource uses based on the resource type and character stats
 */
export function calculateResourceAmount(
    resourceInfo: ResourceInfo,
    character: any
): number {
    switch (resourceInfo.type) {
        case "once":
            return 1;

        case "proficiency":
            // Proficiency bonus based on character level
            return Math.ceil(character.level / 4) + 1;

        case "lvl":
            return character.level;

        case "attribute":
            // This would need additional logic to determine which attribute
            // For now, return a default based on spellcasting ability
            const spellcastingAttr = character.class.spellcastingAbility;
            if (spellcastingAttr) {
                const attrValue =
                    character.attributes[
                        spellcastingAttr as keyof typeof character.attributes
                    ];
                return Math.floor((attrValue - 10) / 2); // Attribute modifier
            }
            return 0;

        default:
            return 0;
    }
}

/**
 * Reset all character resources that reset on the specified rest type
 */
export function resetCharacterResources(
    characterId: string,
    restType: "short" | "long"
) {
    console.log(`Triggering resource reset for a ${restType} rest.`);
    // Get all localStorage keys for this character's resources
    // TODO: Use restType to filter which resources reset on short vs long rest
    const resourceKeys = Object.keys(localStorage).filter(
        (key) => key.startsWith(`resource_`) && key.endsWith(`_${characterId}`)
    );

    resourceKeys.forEach((key) => {
        try {
            const resourceData = localStorage.getItem(key);
            if (resourceData) {
                const parsedData = JSON.parse(resourceData);
                if (Array.isArray(parsedData)) {
                    // Reset the resource array to all false
                    const resetArray = parsedData.map(() => false);
                    localStorage.setItem(key, JSON.stringify(resetArray));
                }
            }
        } catch {
            // Ignore parsing errors
        }
    });
}

export function groupAndSortSpells(spells: Spell[]) {
    const grouped: Record<number, Spell[]> = {};
    spells.forEach((spell) => {
        if (!grouped[spell.level]) {
            grouped[spell.level] = [];
        }
        grouped[spell.level].push(spell);
    });
    Object.keys(grouped).forEach((level) => {
        grouped[Number(level)].sort((a, b) => a.name.localeCompare(b.name));
    });
    return grouped;
}

export function convertRange(range: string, unit: "ft" | "m") {
    const regex = /(\d+)\s*ft\b/gi;
    if (unit === "m") {
        return range.replace(
            regex,
            (_, num) => `${Math.round(Number(num) * 0.3048)} m`
        );
    } else {
        return range;
    }
}

export function getCasterType(characterClass: string): string {
    const fullCasters = ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"];
    const halfCasters = ["Paladin", "Ranger"];
    const thirdCasters = ["Eldritch Knight", "Arcane Trickster"];
    if (fullCasters.includes(characterClass)) return "full-caster";
    else if (halfCasters.includes(characterClass)) return "half-caster";
    else if (thirdCasters.includes(characterClass)) return "subclass";
    else if (characterClass === "Warlock") return "warlock";
    return "None";
}

export function generateCharacterId(
    name: string,
    className: string,
    subclass?: string
): string {
    // Clean the strings by removing spaces and special characters, converting to lowercase
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanClass = className.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanSubclass = subclass ? subclass.toLowerCase() : "";

    // Create the ID
    if (cleanSubclass) {
        return `${cleanName}_${cleanClass}_${cleanSubclass}`;
    } else {
        return `${cleanName}_${cleanClass}`;
    }
}

/**
 * Get always prepared spells for a character based on class, subclass, and level
 */
export async function getAlwaysPreparedSpells(
    character: Character
): Promise<string[]> {
    const alwaysPreppedSpells: string[] = [];

    // Class-based always prepared spells from database
    const classIndex = character.class.name.toLowerCase().replace(/\s+/g, "-");
    const classSpells = await fetchClassPreparedSpells(
        classIndex,
        character.level
    );
    alwaysPreppedSpells.push(...classSpells);

    // Subclass-based always prepared spells from database
    if (character.class.subclass) {
        const subclassIndex = character.class.subclass.name
            .toLowerCase()
            .replace(/\s+/g, "-");
        const subclassSpells = await fetchSubclassPreparedSpells(
            subclassIndex,
            character.level
        );
        alwaysPreppedSpells.push(...subclassSpells);
    }

    // Character-specific always prepared spells
    if (character.alwaysPreparedSpells) {
        alwaysPreppedSpells.push(...character.alwaysPreparedSpells);
    }

    // Remove duplicates
    return Array.from(new Set(alwaysPreppedSpells));
}

/**
 * Toggle always remembered status for a spell for a character
 */
export function toggleAlwaysRememberedSpell(
    characterId: string,
    spellIndex: string
): void {
    try {
        const key = `alwaysRemembered_${characterId}`;
        const stored = localStorage.getItem(key);
        let alwaysRemembered: string[] = stored ? JSON.parse(stored) : [];

        if (alwaysRemembered.includes(spellIndex)) {
            alwaysRemembered = alwaysRemembered.filter(
                (index) => index !== spellIndex
            );
        } else {
            alwaysRemembered.push(spellIndex);
        }

        localStorage.setItem(key, JSON.stringify(alwaysRemembered));
    } catch (error) {
        console.error("Failed to toggle always remembered spell:", error);
    }
}

/**
 * Get always remembered spells for a character
 */
export function getAlwaysRememberedSpells(characterId: string): string[] {
    try {
        const key = `alwaysRemembered_${characterId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to get always remembered spells:", error);
        return [];
    }
}

/**
 * Check if a spell is always remembered for a character
 */
export function isSpellAlwaysRemembered(
    characterId: string,
    spellIndex: string
): boolean {
    const alwaysRemembered = getAlwaysRememberedSpells(characterId);
    return alwaysRemembered.includes(spellIndex);
}

export function mapAoETypeIcons(
    type: string | undefined
): React.ReactElement | string | null {
    switch (type?.toLowerCase()) {
        case "cone":
            return React.createElement(TbCone2);
        case "cube":
            return React.createElement(GiCube);
        case "line":
            return "|";
        case "sphere":
            return React.createElement(TbSphere);
        case "cylinder":
            return React.createElement(PiCylinder);
        default:
            return null;
    }
}

export function mapDamageTypeIcons(type: string | undefined): React.ReactElement | null {
    switch (type?.toLowerCase()) {
        case "acid":
            return React.createElement(GiNuclear);
        case "bludgeoning":
            return React.createElement(GiHammerDrop);
        case "cold":
            return React.createElement(GiTensionSnowflake);
        case "fire":
            return React.createElement(GiFire);
        case "force":
            return React.createElement(GiWindHole);
        case "lightning":
            return React.createElement(GiLightningBranches);
        case "necrotic":
            return React.createElement(GiDeathSkull);
        case "piercing":
            return React.createElement(GiArrowhead);
        case "poison":
            return React.createElement(GiPoisonBottle);
        case "psychic":
            return React.createElement(GiBrain);
        case "radiant":
            return React.createElement(GiSunbeams);
        case "slashing":
            return React.createElement(GiQuickSlash);
        case "thunder":
            return React.createElement(GiSpeaker);
        default:
            return null;
    }
}
