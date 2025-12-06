import { getCasterType } from "./functions";
import supabase from "./supabase";
import type { Character, ClassName, Spell } from "./types/types";

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

export async function fetchSubclassPreparedSpells(subclassIndex: string, characterLevel: number, landType?: string): Promise<string[]> {
    let query = supabase
        .from('subclass_prepared_spells')
        .select('spell_index, subclass_special')
        .eq('subclass_index', subclassIndex)
        .lte('level_required', characterLevel);
        
    const { data, error } = await query;
        
    if (error) {
        console.error('Error fetching subclass prepared spells:', error.message);
        return [];
    }
    
    if (!data) return [];
        
    const filteredData = data.filter(row => {        
        if (!row.subclass_special) {
            return true;
        }
                
        if (landType && Array.isArray(row.subclass_special)) {
            return row.subclass_special.includes(landType);
        }
                
        return false;
    });
    
    return filteredData.map(row => row.spell_index);
}
export async function fetchDmgCharLvl(spellIndex: string): Promise<any | null> {
    const { data, error } = await supabase
        .from('spell_dmg_char_lvl')
        .select('1,5,11,17')
        .eq('index', spellIndex)
        .maybeSingle();
    if (error) {
        console.error('Error fetching damage at character level:', error.message);
        return null;
    }
    return data || null;
}
export async function fetchSpellAtSlot(spellIndex: string, healOrDmg: 'heal' | 'dmg'): Promise<{[key: number]: string} | null> {
    const { data, error } = await supabase
        .from(healOrDmg === 'heal' ? 'spell_heal_slot_lvl' : 'spell_dmg_slot_lvl')
        .select('1,2,3,4,5,6,7,8,9')
        .eq('index', spellIndex)
        .single();
    if (error) {
        console.error('Error fetching healing at higher slot:', error.message);
        return null;
    }
    return data || null;
}
export async function fetchSpellTable(spellIndex: string): Promise<JSON> {
    const { data, error } = await supabase
        .from('spell_desc_table')
        .select('data')
        .eq('index', spellIndex)
        .single();
    if (error) {
        console.error('Error fetching spell table:', error.message);
        return {} as JSON;
    }
    return data.data as unknown as JSON || {} as JSON;
}
export async function fetchSpellAdditionalDesc(spellIndex: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('spell_desc_additional')
        .select('desc')
        .eq('index', spellIndex)
        .single();
    if (error) {
        console.error('Error fetching spell additional description:', error.message);
        return [];
    }
    return data ? data.desc : [];
}
export async function fetchClassRessource(characterClass: ClassName,characterLevel: number, characterSubclass?: string): Promise<any[] | null> {
    if(characterSubclass){
        const subclass = characterSubclass.toLowerCase().replace(/\s+/g, '-');
        const { data, error} = await supabase
            .from('class_resources')
            .select('resource_index,resources(name), lvl, resets_on, type, resource_table(uses)')
            .eq('class_index', characterClass.toLocaleLowerCase()).lte('lvl', characterLevel).or('subclass_index.eq.'+subclass+',subclass_index.is.null');
        if (error) {
            console.error('Error fetching class resources:', error.message);
            return null;
        }
        return data ? data : null;
    } else {
        const { data, error} = await supabase
            .from('class_resources')
            .select('resource_index,resources(name), lvl, resets_on, type, resource_table(uses)')
            .eq('class_index', characterClass.toLocaleLowerCase()).lte('lvl', characterLevel);
        if (error) {
            console.error('Error fetching class resources:', error.message);
            return null;
        }
        return data ? data : null;
    }
}