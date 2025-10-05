import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";

const DruidResources: React.FC = () => {
    const { character } = useSettings();
    return (
        <div>
            <h3>{character.class.name} Resources</h3>
            {character.level >= 2 && (
                <ResourceCheckboxes
                    resourceName="Wild Shape"
                    maxAmount={2}
                    characterId={character.id}
                    resetsOn="short-long"
                />
            )}
        </div>
    );
};

export default DruidResources;
