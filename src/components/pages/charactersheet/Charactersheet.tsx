import React from "react";
import { useSettings } from "../../../context/SettingsContext";
import { useResources } from "../../../context/ResourcesContext";
import BarbarianResources from "./classes/barbarian/BarbarianResources";
import BardResources from "./classes/bard/BardResources";
import ClericResources from "./classes/cleric/ClericResources";
import DruidResources from "./classes/druid/DruidResources";
import FighterResources from "./classes/fighter/FighterResources";
import MonkResources from "./classes/monk/MonkResources";
import PaladinResources from "./classes/paladin/PaladinResources";
import RangerResources from "./classes/ranger/RangerResources";
import RogueResources from "./classes/rogue/RogueResources";
import SorcererResources from "./classes/sorcerer/SorcererResources";
import WarlockResources from "./classes/warlock/WarlockResources";
import WizardResources from "./classes/wizard/WizardResources";
import Spellarea from "../../partials/spellarea/Spellarea";
import RestButtons from "../../partials/restbuttons/RestButtons";
import { resetCharacterResources } from "../../../utils/functions";
import {
    getSpellSaveDC,
    getSpellAttackBonus,
} from "../../../utils/characterFuncs";

const CharacterSheet: React.FC = () => {
    const { character } = useSettings();
    const { triggerReset } = useResources();
    const classResourceMap: Record<string, React.FC> = {
        Barbarian: BarbarianResources,
        Bard: BardResources,
        Cleric: ClericResources,
        Druid: DruidResources,
        Fighter: FighterResources,
        Monk: MonkResources,
        Paladin: PaladinResources,
        Ranger: RangerResources,
        Rogue: RogueResources,
        Sorcerer: SorcererResources,
        Warlock: WarlockResources,
        Wizard: WizardResources,
    };
    const ClassSpecificResources =
        classResourceMap[character.class.name] || null;

    const handleLongRest = () => {
        resetCharacterResources(character.id, "long");
        triggerReset("long");
    };
    const handleShortRest = () => {
        resetCharacterResources(character.id, "short");
        triggerReset("short");
    };

    return (
        <>
            <h2>Character Sheet</h2>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}
            >
                <div>
                    <h3>General Information</h3>
                    <p>
                        <b>Name:</b> {character.name}
                        <br />
                        <b>Level:</b> {character.level}
                        <br />
                        <b>Class:</b> {character.class.name}
                        <br />
                        {character.class.subclass && (
                            <>
                                <b>Subclass:</b>{" "}
                                {character.class.subclass?.name || "None"}
                            </>
                        )}
                    </p>
                </div>
                {character.spellIndices !== undefined && (
                    <div>
                        <h3>Spellcasting</h3>
                        <div>
                            <b>Spellcasting Attribute:</b>{" "}
                            {character.class.spellcastingAbility ||
                                "Loading..."}
                        </div>
                        <ul>
                            <li>
                                <b>Spell Save DC:</b>{" "}
                                {getSpellSaveDC(character)}
                            </li>
                            <li>
                                <b>Spell Attack Bonus:</b> +
                                {getSpellAttackBonus(character)}
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            <h2>Class Resources</h2>
            {ClassSpecificResources &&
                React.createElement(ClassSpecificResources)}
            <Spellarea />

            <RestButtons
                handleLongRest={handleLongRest}
                handleShortRest={handleShortRest}
            />
        </>
    );
};

export default CharacterSheet;
