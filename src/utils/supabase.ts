import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VERCEL_ENV === 'preview' ? process.env.NEXT_PUBLIC_SUPABASE_URL : import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =  process.env.VERCEL_ENV === 'preview' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : import.meta.env.VITE_SUPABASE_ANON_KEY;

if(supabaseUrl === undefined || supabaseKey === undefined) {
    throw new Error("Missing Supabase environment variables");
}
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase