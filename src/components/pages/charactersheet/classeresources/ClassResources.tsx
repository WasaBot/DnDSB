import React, { useEffect } from "react";
import { useSettings } from "../../../../context/SettingsContext";
import ResourceCheckboxes from "../../../common/ResourceCheckboxes";
import { fetchClassRessource } from "../../../../utils/dbFuncs";
import { getAbilityModifier, getProficiencyBonus } from "../../../../utils/characterFuncs";

const ClassResources: React.FC = () => {
    const { character } = useSettings();
    const [charResources,setCharResources] = React.useState<any[] | null>(null);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const fetchedResources = await fetchClassRessource(character.class.name, character.level, character.class.subclass?.name);        
                setCharResources(fetchedResources);
                console.log("Fetched resources:", fetchedResources);
            } catch (error) {
                setCharResources(null);
            }
        };

        fetchResources();
    }, [character]);

    const getMaxResourceAmount = (resourceType: String, resource_table_uses?: number[]): number => {        
        switch(resourceType){
            case 'once':
                return 1;
            case 'twice':
                return 2;
            case 'thrice':
                return 3;
            case 'attribute':
                let abilityMod = 0;
                if(character.class.spellcastingAbility){
                    abilityMod = getAbilityModifier(character.attributes[character.class.spellcastingAbility as keyof typeof character.attributes]);
                }
                else if (character.class.name === 'Fighter'){
                    abilityMod = getAbilityModifier(character.attributes['Strength']);
                } else {
                    abilityMod = getAbilityModifier(character.attributes['Constitution']);
                }                
                return abilityMod > 0 ? abilityMod : 1;                
            case 'proficiency':
                return getProficiencyBonus(character.level);
            case 'lvl':
                return character.level;
            case 'table':
                if(resource_table_uses && resource_table_uses.length > 0){
                    return resource_table_uses[character.level-1];
                } else {
                    return 1;
                }
            default:
                return 1;
        }
    }

    return (
        <div>
            <h3>{character.class.name} Resources</h3>
            {charResources && charResources.length > 0 && charResources.map(resource => (
            <ResourceCheckboxes
                key={resource.resource_index}
                resourceName={resource.resources.name}
                maxAmount={getMaxResourceAmount(resource.type, resource.type === 'table' ? resource.resource_table.uses : [])}
                characterId={character.id}
                resetsOn={resource.resets_on}
            />))}
        </div>
    );
};

export default ClassResources;
