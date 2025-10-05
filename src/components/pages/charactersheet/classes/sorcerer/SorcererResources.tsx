import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";
import "../../../../common/ResourceCheckboxes.css";

const SorcererResources: React.FC = () => {
    const { character } = useSettings();

    return (
        <div>
            <h3>{character.class.name} Resources</h3>
            {character.level >= 2 && (
                <ResourceCheckboxes
                    resourceName="Sorcery Points"
                    maxAmount={character.level}
                    characterId={character.id}
                    resetsOn="long"
                />
            )}
        </div>
    );
};

export default SorcererResources;
