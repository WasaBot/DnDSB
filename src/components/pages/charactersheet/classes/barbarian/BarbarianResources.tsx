import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";

const BarbarianResources: React.FC = () => {
  const { character } = useSettings();
  const rageAmount = [
    {min: 1, max: 2, value: 2},
    {min: 3, max: 5, value: 3},
    {min: 6, max: 11, value: 4},
    {min: 12, max: 16, value: 5},
    {min: 17, max: 19, value: 6},
    {min: 20, max: 20, value: 999}
  ]

  return (
    <div>
        <h3>{character.class.name} Resources</h3>
        <ResourceCheckboxes
            resourceName="Rage"
            maxAmount={rageAmount.find(r => character.level >= r.min && character.level <= r.max)?.value || 0}
            characterId={character.id}
            resetsOn="long"
        />
    </div>
  );
};

export default BarbarianResources;
