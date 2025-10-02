export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attributes: {
        Row: {
          id: number
          name: string
          short_name: string
        }
        Insert: {
          id?: number
          name: string
          short_name: string
        }
        Update: {
          id?: number
          name?: string
          short_name?: string
        }
        Relationships: []
      }
      class_prepared_spells: {
        Row: {
          class_index: string
          created_at: string | null
          id: number
          level_required: number
          spell_index: string
        }
        Insert: {
          class_index: string
          created_at?: string | null
          id?: number
          level_required: number
          spell_index: string
        }
        Update: {
          class_index?: string
          created_at?: string | null
          id?: number
          level_required?: number
          spell_index?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_prepared_spells_class_index_fkey"
            columns: ["class_index"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["class_index"]
          },
          {
            foreignKeyName: "class_prepared_spells_spell_index_fkey"
            columns: ["spell_index"]
            isOneToOne: false
            referencedRelation: "spells"
            referencedColumns: ["index"]
          },
        ]
      }
      class_resources: {
        Row: {
          class_index: string
          id: number
          lvl: number
          resets_on: Database["public"]["Enums"]["resets_on"]
          resource_index: string
          subclass_index: string | null
          type: Database["public"]["Enums"]["resource_types"]
        }
        Insert: {
          class_index: string
          id?: number
          lvl: number
          resets_on: Database["public"]["Enums"]["resets_on"]
          resource_index: string
          subclass_index?: string | null
          type: Database["public"]["Enums"]["resource_types"]
        }
        Update: {
          class_index?: string
          id?: number
          lvl?: number
          resets_on?: Database["public"]["Enums"]["resets_on"]
          resource_index?: string
          subclass_index?: string | null
          type?: Database["public"]["Enums"]["resource_types"]
        }
        Relationships: [
          {
            foreignKeyName: "class_resources_class_index_fkey"
            columns: ["class_index"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["class_index"]
          },
          {
            foreignKeyName: "class_resources_resource_index_fkey"
            columns: ["resource_index"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["index"]
          },
          {
            foreignKeyName: "class_resources_subclass_index_fkey"
            columns: ["subclass_index"]
            isOneToOne: false
            referencedRelation: "subclasses"
            referencedColumns: ["index"]
          },
        ]
      }
      classes: {
        Row: {
          caster_type: Database["public"]["Enums"]["caster-types"] | null
          class_index: string
          class_name: string
          id: number
          spellcast_attribute_id: number | null
          spells_from_lvl: number | null
          subclass_from_lvl: number | null
        }
        Insert: {
          caster_type?: Database["public"]["Enums"]["caster-types"] | null
          class_index: string
          class_name: string
          id?: number
          spellcast_attribute_id?: number | null
          spells_from_lvl?: number | null
          subclass_from_lvl?: number | null
        }
        Update: {
          caster_type?: Database["public"]["Enums"]["caster-types"] | null
          class_index?: string
          class_name?: string
          id?: number
          spellcast_attribute_id?: number | null
          spells_from_lvl?: number | null
          subclass_from_lvl?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_caster_type_fkey"
            columns: ["caster_type"]
            isOneToOne: false
            referencedRelation: "spellslots"
            referencedColumns: ["caster_type"]
          },
          {
            foreignKeyName: "classes_spellcast_attribute_id_fkey"
            columns: ["spellcast_attribute_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          id: number
          index: string
          name: string
        }
        Insert: {
          id?: number
          index: string
          name: string
        }
        Update: {
          id?: number
          index?: string
          name?: string
        }
        Relationships: []
      }
      spells: {
        Row: {
          "area_of_effect/size": string | null
          "area_of_effect/type": string | null
          attack_type: string | null
          casting_time: string | null
          "components/0": string | null
          "components/1": string | null
          "components/2": string | null
          concentration: boolean | null
          "damage/damage_at_character_level/1": string | null
          "damage/damage_at_character_level/11": string | null
          "damage/damage_at_character_level/17": string | null
          "damage/damage_at_character_level/5": string | null
          "damage/damage_at_slot_level/1": string | null
          "damage/damage_at_slot_level/2": string | null
          "damage/damage_at_slot_level/3": string | null
          "damage/damage_at_slot_level/4": string | null
          "damage/damage_at_slot_level/5": string | null
          "damage/damage_at_slot_level/6": string | null
          "damage/damage_at_slot_level/7": string | null
          "damage/damage_at_slot_level/8": string | null
          "damage/damage_at_slot_level/9": string | null
          "damage/damage_type/index": string | null
          "damage/damage_type/name": string | null
          "dc/dc_success": string | null
          "dc/dc_type/index": string | null
          "dc/dc_type/name": string | null
          "dc/desc/0": string | null
          "desc/0": string | null
          "desc/1": string | null
          "desc/10": string | null
          "desc/11": string | null
          "desc/12": string | null
          "desc/13": string | null
          "desc/14": string | null
          "desc/15": string | null
          "desc/16": string | null
          "desc/17": string | null
          "desc/18": string | null
          "desc/19": string | null
          "desc/2": string | null
          "desc/20": string | null
          "desc/21": string | null
          "desc/22": string | null
          "desc/23": string | null
          "desc/24": string | null
          "desc/25": string | null
          "desc/26": string | null
          "desc/27": string | null
          "desc/3": string | null
          "desc/4": string | null
          "desc/5": string | null
          "desc/6": string | null
          "desc/7": string | null
          "desc/8": string | null
          "desc/9": string | null
          duration: string | null
          "heal_at_slot_level/1": string | null
          "heal_at_slot_level/2": string | null
          "heal_at_slot_level/3": string | null
          "heal_at_slot_level/4": string | null
          "heal_at_slot_level/5": string | null
          "heal_at_slot_level/6": string | null
          "heal_at_slot_level/7": string | null
          "heal_at_slot_level/8": string | null
          "heal_at_slot_level/9": string | null
          "higher_level/0": string | null
          index: string
          level: number | null
          material: string | null
          name: string | null
          range: string | null
          ritual: boolean | null
          "school/index": string | null
          "school/name": string | null
        }
        Insert: {
          "area_of_effect/size"?: string | null
          "area_of_effect/type"?: string | null
          attack_type?: string | null
          casting_time?: string | null
          "components/0"?: string | null
          "components/1"?: string | null
          "components/2"?: string | null
          concentration?: boolean | null
          "damage/damage_at_character_level/1"?: string | null
          "damage/damage_at_character_level/11"?: string | null
          "damage/damage_at_character_level/17"?: string | null
          "damage/damage_at_character_level/5"?: string | null
          "damage/damage_at_slot_level/1"?: string | null
          "damage/damage_at_slot_level/2"?: string | null
          "damage/damage_at_slot_level/3"?: string | null
          "damage/damage_at_slot_level/4"?: string | null
          "damage/damage_at_slot_level/5"?: string | null
          "damage/damage_at_slot_level/6"?: string | null
          "damage/damage_at_slot_level/7"?: string | null
          "damage/damage_at_slot_level/8"?: string | null
          "damage/damage_at_slot_level/9"?: string | null
          "damage/damage_type/index"?: string | null
          "damage/damage_type/name"?: string | null
          "dc/dc_success"?: string | null
          "dc/dc_type/index"?: string | null
          "dc/dc_type/name"?: string | null
          "dc/desc/0"?: string | null
          "desc/0"?: string | null
          "desc/1"?: string | null
          "desc/10"?: string | null
          "desc/11"?: string | null
          "desc/12"?: string | null
          "desc/13"?: string | null
          "desc/14"?: string | null
          "desc/15"?: string | null
          "desc/16"?: string | null
          "desc/17"?: string | null
          "desc/18"?: string | null
          "desc/19"?: string | null
          "desc/2"?: string | null
          "desc/20"?: string | null
          "desc/21"?: string | null
          "desc/22"?: string | null
          "desc/23"?: string | null
          "desc/24"?: string | null
          "desc/25"?: string | null
          "desc/26"?: string | null
          "desc/27"?: string | null
          "desc/3"?: string | null
          "desc/4"?: string | null
          "desc/5"?: string | null
          "desc/6"?: string | null
          "desc/7"?: string | null
          "desc/8"?: string | null
          "desc/9"?: string | null
          duration?: string | null
          "heal_at_slot_level/1"?: string | null
          "heal_at_slot_level/2"?: string | null
          "heal_at_slot_level/3"?: string | null
          "heal_at_slot_level/4"?: string | null
          "heal_at_slot_level/5"?: string | null
          "heal_at_slot_level/6"?: string | null
          "heal_at_slot_level/7"?: string | null
          "heal_at_slot_level/8"?: string | null
          "heal_at_slot_level/9"?: string | null
          "higher_level/0"?: string | null
          index: string
          level?: number | null
          material?: string | null
          name?: string | null
          range?: string | null
          ritual?: boolean | null
          "school/index"?: string | null
          "school/name"?: string | null
        }
        Update: {
          "area_of_effect/size"?: string | null
          "area_of_effect/type"?: string | null
          attack_type?: string | null
          casting_time?: string | null
          "components/0"?: string | null
          "components/1"?: string | null
          "components/2"?: string | null
          concentration?: boolean | null
          "damage/damage_at_character_level/1"?: string | null
          "damage/damage_at_character_level/11"?: string | null
          "damage/damage_at_character_level/17"?: string | null
          "damage/damage_at_character_level/5"?: string | null
          "damage/damage_at_slot_level/1"?: string | null
          "damage/damage_at_slot_level/2"?: string | null
          "damage/damage_at_slot_level/3"?: string | null
          "damage/damage_at_slot_level/4"?: string | null
          "damage/damage_at_slot_level/5"?: string | null
          "damage/damage_at_slot_level/6"?: string | null
          "damage/damage_at_slot_level/7"?: string | null
          "damage/damage_at_slot_level/8"?: string | null
          "damage/damage_at_slot_level/9"?: string | null
          "damage/damage_type/index"?: string | null
          "damage/damage_type/name"?: string | null
          "dc/dc_success"?: string | null
          "dc/dc_type/index"?: string | null
          "dc/dc_type/name"?: string | null
          "dc/desc/0"?: string | null
          "desc/0"?: string | null
          "desc/1"?: string | null
          "desc/10"?: string | null
          "desc/11"?: string | null
          "desc/12"?: string | null
          "desc/13"?: string | null
          "desc/14"?: string | null
          "desc/15"?: string | null
          "desc/16"?: string | null
          "desc/17"?: string | null
          "desc/18"?: string | null
          "desc/19"?: string | null
          "desc/2"?: string | null
          "desc/20"?: string | null
          "desc/21"?: string | null
          "desc/22"?: string | null
          "desc/23"?: string | null
          "desc/24"?: string | null
          "desc/25"?: string | null
          "desc/26"?: string | null
          "desc/27"?: string | null
          "desc/3"?: string | null
          "desc/4"?: string | null
          "desc/5"?: string | null
          "desc/6"?: string | null
          "desc/7"?: string | null
          "desc/8"?: string | null
          "desc/9"?: string | null
          duration?: string | null
          "heal_at_slot_level/1"?: string | null
          "heal_at_slot_level/2"?: string | null
          "heal_at_slot_level/3"?: string | null
          "heal_at_slot_level/4"?: string | null
          "heal_at_slot_level/5"?: string | null
          "heal_at_slot_level/6"?: string | null
          "heal_at_slot_level/7"?: string | null
          "heal_at_slot_level/8"?: string | null
          "heal_at_slot_level/9"?: string | null
          "higher_level/0"?: string | null
          index?: string
          level?: number | null
          material?: string | null
          name?: string | null
          range?: string | null
          ritual?: boolean | null
          "school/index"?: string | null
          "school/name"?: string | null
        }
        Relationships: []
      }
      spellslots: {
        Row: {
          caster_type: Database["public"]["Enums"]["caster-types"]
          id: number
          spellslots_at_lvl_1: number[] | null
          spellslots_at_lvl_10: number[] | null
          spellslots_at_lvl_11: number[] | null
          spellslots_at_lvl_12: number[] | null
          spellslots_at_lvl_13: number[] | null
          spellslots_at_lvl_14: number[] | null
          spellslots_at_lvl_15: number[] | null
          spellslots_at_lvl_16: number[] | null
          spellslots_at_lvl_17: number[] | null
          spellslots_at_lvl_18: number[] | null
          spellslots_at_lvl_19: number[] | null
          spellslots_at_lvl_2: number[] | null
          spellslots_at_lvl_20: number[] | null
          spellslots_at_lvl_3: number[] | null
          spellslots_at_lvl_4: number[] | null
          spellslots_at_lvl_5: number[] | null
          spellslots_at_lvl_6: number[] | null
          spellslots_at_lvl_7: number[] | null
          spellslots_at_lvl_8: number[] | null
          spellslots_at_lvl_9: number[] | null
          subclass_index: string | null
        }
        Insert: {
          caster_type: Database["public"]["Enums"]["caster-types"]
          id?: number
          spellslots_at_lvl_1?: number[] | null
          spellslots_at_lvl_10?: number[] | null
          spellslots_at_lvl_11?: number[] | null
          spellslots_at_lvl_12?: number[] | null
          spellslots_at_lvl_13?: number[] | null
          spellslots_at_lvl_14?: number[] | null
          spellslots_at_lvl_15?: number[] | null
          spellslots_at_lvl_16?: number[] | null
          spellslots_at_lvl_17?: number[] | null
          spellslots_at_lvl_18?: number[] | null
          spellslots_at_lvl_19?: number[] | null
          spellslots_at_lvl_2?: number[] | null
          spellslots_at_lvl_20?: number[] | null
          spellslots_at_lvl_3?: number[] | null
          spellslots_at_lvl_4?: number[] | null
          spellslots_at_lvl_5?: number[] | null
          spellslots_at_lvl_6?: number[] | null
          spellslots_at_lvl_7?: number[] | null
          spellslots_at_lvl_8?: number[] | null
          spellslots_at_lvl_9?: number[] | null
          subclass_index?: string | null
        }
        Update: {
          caster_type?: Database["public"]["Enums"]["caster-types"]
          id?: number
          spellslots_at_lvl_1?: number[] | null
          spellslots_at_lvl_10?: number[] | null
          spellslots_at_lvl_11?: number[] | null
          spellslots_at_lvl_12?: number[] | null
          spellslots_at_lvl_13?: number[] | null
          spellslots_at_lvl_14?: number[] | null
          spellslots_at_lvl_15?: number[] | null
          spellslots_at_lvl_16?: number[] | null
          spellslots_at_lvl_17?: number[] | null
          spellslots_at_lvl_18?: number[] | null
          spellslots_at_lvl_19?: number[] | null
          spellslots_at_lvl_2?: number[] | null
          spellslots_at_lvl_20?: number[] | null
          spellslots_at_lvl_3?: number[] | null
          spellslots_at_lvl_4?: number[] | null
          spellslots_at_lvl_5?: number[] | null
          spellslots_at_lvl_6?: number[] | null
          spellslots_at_lvl_7?: number[] | null
          spellslots_at_lvl_8?: number[] | null
          spellslots_at_lvl_9?: number[] | null
          subclass_index?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spellslots_subclass_index_fkey"
            columns: ["subclass_index"]
            isOneToOne: true
            referencedRelation: "subclasses"
            referencedColumns: ["index"]
          },
        ]
      }
      subclass_prepared_spells: {
        Row: {
          created_at: string | null
          id: number
          level_required: number
          spell_index: string
          subclass_index: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          level_required: number
          spell_index: string
          subclass_index: string
        }
        Update: {
          created_at?: string | null
          id?: number
          level_required?: number
          spell_index?: string
          subclass_index?: string
        }
        Relationships: [
          {
            foreignKeyName: "subclass_prepared_spells_spell_index_fkey"
            columns: ["spell_index"]
            isOneToOne: false
            referencedRelation: "spells"
            referencedColumns: ["index"]
          },
          {
            foreignKeyName: "subclass_prepared_spells_subclass_index_fkey"
            columns: ["subclass_index"]
            isOneToOne: false
            referencedRelation: "subclasses"
            referencedColumns: ["index"]
          },
        ]
      }
      subclasses: {
        Row: {
          base_class: string
          id: number
          index: string
          spellcasting_attribute_id: number | null
          subclass: string
        }
        Insert: {
          base_class: string
          id?: number
          index: string
          spellcasting_attribute_id?: number | null
          subclass: string
        }
        Update: {
          base_class?: string
          id?: number
          index?: string
          spellcasting_attribute_id?: number | null
          subclass?: string
        }
        Relationships: [
          {
            foreignKeyName: "subclasses_base_class_fkey"
            columns: ["base_class"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["class_index"]
          },
          {
            foreignKeyName: "subclasses_spellcasting_attribute_id_fkey"
            columns: ["spellcasting_attribute_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      action_type: "action" | "bonus-action" | "reaction" | "variable"
      "caster-types": "full-caster" | "half-caster" | "subclass" | "warlock"
      resets_on: "short" | "short-long" | "long"
      resource_types: "once" | "proficiency" | "lvl" | "attribute"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      action_type: ["action", "bonus-action", "reaction", "variable"],
      "caster-types": ["full-caster", "half-caster", "subclass", "warlock"],
      resets_on: ["short", "short-long", "long"],
      resource_types: ["once", "proficiency", "lvl", "attribute"],
    },
  },
} as const
