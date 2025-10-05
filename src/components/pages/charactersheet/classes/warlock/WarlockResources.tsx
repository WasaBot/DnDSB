import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";

const WarlockResources: React.FC = () => {
    const { character } = useSettings();
    return (
        <div>
            <h3>{character.class.name} Resources</h3>
            {character.level >= 11 && (
                <ResourceCheckboxes
                    resourceName="Mystic Arcanum (6th Level)"
                    maxAmount={1}
                    characterId={character.id}
                    resetsOn="long"
                />
            )}
            {character.level >= 13 && (
                <ResourceCheckboxes
                    resourceName="Mystic Arcanum (7th Level)"
                    maxAmount={1}
                    characterId={character.id}
                    resetsOn="long"
                />
            )}
            {character.level >= 15 && (
                <ResourceCheckboxes
                    resourceName="Mystic Arcanum (8th Level)"
                    maxAmount={1}
                    characterId={character.id}
                    resetsOn="long"
                />
            )}
            {character.level >= 17 && (
                <ResourceCheckboxes
                    resourceName="Mystic Arcanum (9th Level)"
                    maxAmount={1}
                    characterId={character.id}
                    resetsOn="long"
                />
            )}
            {character.level === 20 && (
                <ResourceCheckboxes
                    resourceName="Eldritch Master"
                    maxAmount={1}
                    characterId={character.id}
                    resetsOn="long"
                />
            )}
        </div>
    );
};

export default WarlockResources;
