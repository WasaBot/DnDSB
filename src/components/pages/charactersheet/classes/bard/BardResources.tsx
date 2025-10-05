import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";
import { getAbilityModifier } from "../../../../../utils/characterFuncs";

const BardResources: React.FC = () => {
    const { character } = useSettings();
    const bardicInspirationAmount =
        character.attributes.Charisma > 10
            ? getAbilityModifier(character.attributes.Charisma)
            : 1;
    return (
        <div>
            <h3>{character.class.name} Resources</h3>
            <ResourceCheckboxes
                resourceName="Bardic Inspiration"
                maxAmount={bardicInspirationAmount}
                characterId={character.id}
                resetsOn="long"
            />
        </div>
    );
};

export default BardResources;
