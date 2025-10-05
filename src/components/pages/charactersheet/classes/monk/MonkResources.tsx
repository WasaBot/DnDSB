import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";

const MonkResources: React.FC = () => {
    const { character } = useSettings();
    return (
        <div>
            <h3>{character.class.name} Resources</h3>
            {character.level >= 2 && (
                <ResourceCheckboxes
                    resourceName="Ki Points"
                    maxAmount={character.level}
                    characterId={character.id}
                    resetsOn="short-long"
                />
            )}
        </div>
    );
};

export default MonkResources;
