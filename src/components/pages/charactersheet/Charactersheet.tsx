import React from "react";
import { useSettings } from "../../../context/SettingsContext";
import BarbarianResources from "./classes/barbarian/BarbarianResources";
import BardResources from "./classes/bard/BardResources";
import ClericResources from "./classes/cleric/ClericResources";
import DruidResources from "./classes/druid/DruidResources";
import FighterResources from "./classes/fighter/FighterResources";
import MonkResources from "./classes/monk/MonkResources";
import PaladinResources from "./classes/paladin/PaladinResources";
import RangerResources from "./classes/ranger/RangerResources";
import RogueResources from "./classes/rogue/RogueResources";
import SorcererResources from "./classes/sorcerer/SorcererResources";
import WarlockResources from "./classes/warlock/WarlockResources";
import WizardResources from "./classes/wizard/WizardResources";
import Spellarea from "../../partials/spellarea/Spellarea";
import RestButtons from "../../partials/restbuttons/RestButtons";

const CharacterSheet: React.FC = () => {
  const { character } = useSettings();
  const classResourceMap: Record<string, React.FC> = {
    Barbarian: BarbarianResources,
    Bard: BardResources,
    Cleric: ClericResources,
    Druid: DruidResources,
    Fighter: FighterResources,
    Monk: MonkResources,
    Paladin: PaladinResources,
    Ranger: RangerResources,
    Rogue: RogueResources,
    Sorcerer: SorcererResources,
    Warlock: WarlockResources,
    Wizard: WizardResources,
  };
  const ClassSpecificResources = classResourceMap[character.class.name] || null;

  //TODO implement rest functionality for spells and resources
  const handleLongRest = () => {};
  const handleShortRest = () => {};

  return (
    <>
      <h2>Character Sheet</h2>
      <p>
        <b>Name:</b> {character.name}<br />
        <b>Class:</b> {character.class.name}<br />
        <b>Level:</b> {character.level}
      </p>

      <div>
        <h2>Class Resources</h2>
        {ClassSpecificResources && React.createElement(ClassSpecificResources)}
      </div>

      <Spellarea />

      <RestButtons
        handleLongRest={handleLongRest}
        handleShortRest={handleShortRest}
      />
      </>
  );
};

export default CharacterSheet;