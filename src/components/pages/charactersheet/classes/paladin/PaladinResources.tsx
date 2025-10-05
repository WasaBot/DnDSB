import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";

const PaladinResources: React.FC = () => {
const { character } = useSettings();
return (
    <div>
        <h3>{character.class.name} Resources</h3>
        <ResourceCheckboxes
            resourceName="Lay on Hands"
            maxAmount={character.level * 5}
            characterId={character.id}
            resetsOn="short-long"
        />
        {character.level >= 3 && (
          <ResourceCheckboxes
              resourceName="Channel Divinity"
              maxAmount={1}
              characterId={character.id}
              resetsOn="long"
          />
        )}
    </div>
);
};

export default PaladinResources;
