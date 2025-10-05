import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";

const ClericResources: React.FC = () => {
    const { character } = useSettings();
    const channelDivinityAmount =
        character.level >= 6 ? 2 : character.level >= 18 ? 3 : 1;
    return (
        <div>
            <h3>{character.class.name} Resources</h3>
            {character.level >= 2 && (
                <ResourceCheckboxes
                    resourceName="Channel Divinity"
                    maxAmount={channelDivinityAmount}
                    characterId={character.id}
                    resetsOn="long"
                />
            )}
        </div>
    );
};

export default ClericResources;
