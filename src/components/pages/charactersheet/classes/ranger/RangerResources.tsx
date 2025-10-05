import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";
import { getProficiencyBonus } from "../../../../../utils/characterFuncs";

const RangerResources: React.FC = () => {
    const { character } = useSettings();
    const proficiencyBonus = getProficiencyBonus(character.level);
    return (
        <div>
            <h3>{character.class.name} Resources</h3>
            {character.level >= 2 && (
                <ResourceCheckboxes
                    resourceName="Favored Foe (Optional)"
                    maxAmount={proficiencyBonus}
                    characterId={character.id}
                    resetsOn="long"
                />
            )}
            {character.level >= 10 && (
                <ResourceCheckboxes
                    resourceName="Nature's Veil (Optional)"
                    maxAmount={proficiencyBonus}
                    characterId={character.id}
                    resetsOn="long"
                />
            )}
        </div>
    );
};

export default RangerResources;
