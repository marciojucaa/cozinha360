import { createClient } from '@supabase/supabase-js';

// Usando as chaves que você forneceu como valor padrão (fallback)
const supabaseUrl = process.env.SUPABASE_URL || 'https://moehbxectmgwisqehhlr.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZWhieGVjdG1nd2lzcWVoaGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYyMDUsImV4cCI6MjA4NDA2MjIwNX0.dNeacDBIHQUEg92iOwbrdrof5SynYgJdY-3vTLblL-o';

// Validação de segurança
export const isSupabaseReady = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl !== 'undefined';

if (!isSupabaseReady) {
  console.error("Configuração do Supabase incompleta.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);