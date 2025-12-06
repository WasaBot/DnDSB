import React from "react";
import { useSettings } from "../../../context/SettingsContext";
import { useResources } from "../../../context/ResourcesContext";
import Spellarea from "../../partials/spellarea/Spellarea";
import RestButtons from "../../partials/restbuttons/RestButtons";
import { resetCharacterResources } from "../../../utils/functions";
import {
    getSpellSaveDC,
    getSpellAttackBonus,
} from "../../../utils/characterFuncs";
import ClassResources from "./classeresources/ClassResources";

const CharacterSheet: React.FC = () => {
    const { character } = useSettings();
    const { triggerReset } = useResources();

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
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <Spellarea />
                <ClassResources />
            </div>

            <RestButtons
                handleLongRest={handleLongRest}
                handleShortRest={handleShortRest}
            />
        </>
    );
};

export default CharacterSheet;
