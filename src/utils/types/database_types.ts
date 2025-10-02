// TypeScript interface definitions for new database tables

export interface ClassPreparedSpell {
  id: number;
  class_name: string;
  spell_name: string;
  level_required: number;
  created_at?: string;
}

export interface SubclassPreparedSpell {
  id: number;
  class_name: string;
  subclass_name: string;
  spell_name: string;
  level_required: number;
  created_at?: string;
}