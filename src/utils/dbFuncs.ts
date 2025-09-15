import { getCasterType } from "./functions";
import supabase from "./supabase";
import type { Character, Spell } from "./types/types";

export async function fetchSpellslots(character: Character): Promise<any | string> {
    if (!character.class.name || !character.level) 
        return "Please select a class and level.";
    else if (getCasterType(character.class.name) === "None")
        return "Your class does not have spell slots.";
    const { data, error } = await supabase
        .from('spellslots')
        .select('spellslots_at_lvl_'+character.level.toString())
        .eq('caster_type', getCasterType(character.class.name));
    if (error) {    
        return error.message;
    } else {
        return data;
    }
}

export async function fetchSpellByIndex(spellIndex: string): Promise<Spell> {
    const { data, error } = await supabase
        .from('spells')
        .select('*')
        .eq('index', spellIndex)
        .single();
    if (error) {
        throw new Error(error.message);
    } else {
        return data as Spell;
    }
}

export async function fetchSpellsByIndices(spellIndices: string[]): Promise<Record<string, Spell>> {
    if (spellIndices.length === 0) {
        return {};
    }
    
    const { data, error } = await supabase
        .from('spells')
        .select('*')
        .in('index', spellIndices);
        
    if (error) {
        console.error('Error fetching spells:', error.message);
        return {};
    }
    
    // Convert array to record with index as key
    const spellRecord: Record<string, Spell> = {};
    data?.forEach((spell: Spell) => {
        spellRecord[spell.index] = spell;
    });
    
    return spellRecord;
}