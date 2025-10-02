import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";
import { getSorceryPointsAmount } from "../../../../../utils/functions";
import "../../../../common/ResourceCheckboxes.css";

const SorcererResources: React.FC = () => {
  const { character } = useSettings();
  
  const sorceryPointsAmount = getSorceryPointsAmount(character);

  return (
    <div>
      <h3>{character.class.name} Resources</h3>
      
      {character.level >= 2 && (
        <ResourceCheckboxes
          resourceName="Sorcery Points"
          maxAmount={sorceryPointsAmount}
          characterId={character.id}
          resetsOn="long"
        />
      )}
      
      {character.level < 2 && (
        <p style={{ color: "#666", fontStyle: "italic" }}>
          Sorcery Points available at level 2
        </p>
      )}
    </div>
  );
};

export default SorcererResources;
