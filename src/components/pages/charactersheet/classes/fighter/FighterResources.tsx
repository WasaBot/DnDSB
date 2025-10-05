import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";

const FighterResources: React.FC = () => {
    const { character } = useSettings();
    return (
        <div>
            <h3>{character.class.name} Resources</h3>
            <ResourceCheckboxes
                resourceName="Second Wind"
                maxAmount={1}
                characterId={character.id}
                resetsOn="short-long"
            />
            {character.level >= 2 && (
                <ResourceCheckboxes
                    resourceName="Action Surge"
                    maxAmount={character.level >= 17 ? 2 : 1}
                    characterId={character.id}
                    resetsOn="short-long"
                />
            )}
            {character.level >= 9 && (
                <ResourceCheckboxes
                    resourceName="Indomitable"
                    maxAmount={
                        character.level >= 17
                            ? 3
                            : character.level >= 13
                            ? 2
                            : 1
                    }
                    characterId={character.id}
                    resetsOn="long"
                />
            )}
        </div>
    );
};

export default FighterResources;
