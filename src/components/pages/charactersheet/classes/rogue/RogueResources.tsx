import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";

const RogueResources: React.FC = () => {
  const { character } = useSettings();
    return (
        <div>
            <h3>{character.class.name} Resources</h3>
            {character.level === 20 && (
                <ResourceCheckboxes
                    resourceName="Stroke of Luck"
                    maxAmount={1}
                    characterId={character.id}
                    resetsOn="short-long"
                />
            )}
    </div>
  );
};

export default RogueResources;
