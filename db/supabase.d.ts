declare module './supabase.js' {
  import { SupabaseClient } from '@supabase/supabase-js';
  
  export const supabase: SupabaseClient;
  
  export function executeSql(sql: string): Promise<any>;
  
  export function initializeDatabase(sqlContent: string): Promise<any>;
}