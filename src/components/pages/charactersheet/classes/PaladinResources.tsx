import React from "react";
import { useSettings } from "../../../../context/SettingsContext";

const PaladinResources: React.FC = () => {
  const { character } = useSettings();
  return (
    <div>
      {character.class.name}
    </div>
  );
};

export default PaladinResources;
