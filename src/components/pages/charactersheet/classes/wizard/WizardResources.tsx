import React from "react";
import { useSettings } from "../../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../../common/ResourceCheckboxes";

const WizardResources: React.FC = () => {
    const { character } = useSettings();
    return (
        <div>
            <h3>{character.class.name} Resources</h3>
            <ResourceCheckboxes
                resourceName="Arcane Recovery"
                maxAmount={1}
                characterId={character.id}
                resetsOn="long"
                toggleChildren
            >
                {Array.from(
                    { length: Math.ceil(character.level / 2) },
                    (_, key) => (
                        <label key={key}>
                            <input
                                id={`arcane-recovery-level-${key}`}
                                name="arcane-recovery-level"
                                type="checkbox"
                            />
                        </label>
                    )
                )}
            </ResourceCheckboxes>
        </div>
    );
};

export default WizardResources;
