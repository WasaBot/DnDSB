import type { Spell, Character } from "./types/types";
import {
    fetchSubclassPreparedSpells,
} from "./dbFuncs";
import { TbCone2, TbSphere } from "react-icons/tb";
import {
    GiArrowhead,
    GiBrain,
    GiCube,
    GiDeathSkull,
    GiHammerDrop,
    GiHealthNormal,
    GiLightningBranches,
    GiNuclear,
    GiPoisonBottle,
    GiQuickSlash,
    GiSoundWaves,
    GiSunbeams,
    GiWindHole,
} from "react-icons/gi";
import {FaRegSnowflake,
    FaFire 
} from "react-icons/fa";
import { PiCylinder } from "react-icons/pi";
import React from "react";

export type ResourceType = "once" | "proficiency" | "lvl" | "attribute";

export interface ResourceInfo {
    resourceIndex: string;
    type: ResourceType;
    level: number;
    resetsOn: "short" | "short-long" | "long";
}

export function calculateResourceAmount(
    resourceInfo: ResourceInfo,
    character: any
): number {
    switch (resourceInfo.type) {
        case "once":
            return 1;

        case "proficiency":
            return Math.ceil(character.level / 4) + 1;

        case "lvl":
            return character.level;

        case "attribute":
            const spellcastingAttr = character.class.spellcastingAbility;
            if (spellcastingAttr) {
                const attrValue =
                    character.attributes[
                        spellcastingAttr as keyof typeof character.attributes
                    ];
                return Math.floor((attrValue - 10) / 2);
            }
            return 0;

        default:
            return 0;
    }
}

export function resetCharacterResources(
    characterId: string,
) {
    const resourceKeys = Object.keys(localStorage).filter(
        (key) => key.startsWith(`resource_`) && key.endsWith(`_${characterId}`)
    );

    resourceKeys.forEach((key) => {
        try {
            const resourceData = localStorage.getItem(key);
            if (resourceData) {
                const parsedData = JSON.parse(resourceData);
                if (Array.isArray(parsedData)) {
                    const resetArray = parsedData.map(() => false);
                    localStorage.setItem(key, JSON.stringify(resetArray));
                }
            }
        } catch {}
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
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanClass = className.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanSubclass = subclass ? subclass.toLowerCase().replace(/[^a-z0-9]/g, "") : "";

    if (cleanSubclass) {
        return `${cleanName}_${cleanClass}_${cleanSubclass}`;
    } else {
        return `${cleanName}_${cleanClass}`;
    }
}

export async function getAlwaysPreparedSpells(
    character: Character
): Promise<string[]> {
    const alwaysPreppedSpells: string[] = [];

    if (character.class.subclass) {
        const subclassIndex = character.class.subclass.name
            .toLowerCase()
            .replace(/\s+/g, "-");
        
        const landType = character.class.subclass.landType;
        const subclassSpells = await fetchSubclassPreparedSpells(
            subclassIndex,
            character.level,
            landType
        );
        alwaysPreppedSpells.push(...subclassSpells);
    }

    if (character.alwaysPreparedSpells) {
        alwaysPreppedSpells.push(...character.alwaysPreparedSpells);
    }

    return Array.from(new Set(alwaysPreppedSpells));
}

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
            return React.createElement(GiNuclear, { style: { color: '#38ff3eff' } });
        case "bludgeoning":
            return React.createElement(GiHammerDrop, { style: { color: '#61463cff' } });
        case "cold":
            return React.createElement(FaRegSnowflake, { style: { color: '#90caf9' } });
        case "fire":
            return React.createElement(FaFire , { style: { color: '#ec2c2cff' } });
        case "force":
            return React.createElement(GiWindHole, { style: { color: '#e07777ff' } });
        case "lightning":
            return React.createElement(GiLightningBranches, { style: { color: '#d1af3dff' } });
        case "necrotic":
            return React.createElement(GiDeathSkull, { style: { color: '#0d6412ff' } });
        case "piercing":
            return React.createElement(GiArrowhead,{ style: { color: '#61463cff' } });
        case "poison":
            return React.createElement(GiPoisonBottle, { style: { color: '#4caf50' } });
        case "psychic":
            return React.createElement(GiBrain, { style: { color: '#d35acdff' } });
        case "radiant":
            return React.createElement(GiSunbeams, { style: { color: '#d1af3dff' } });
        case "slashing":
            return React.createElement(GiQuickSlash, { style: { color: '#61463cff' } });
        case "thunder":
            return React.createElement(GiSoundWaves, { style: { color: '#8e23c0ff' } });
        case "healing":
            return React.createElement(GiHealthNormal, { style: { color: '#4caf50' } });
        default:
            return null;
    }
}
