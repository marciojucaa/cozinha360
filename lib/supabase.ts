
import { createClient } from '@supabase/supabase-js';

// As variáveis devem ser injetadas pelo ambiente de execução.
// Certifique-se de que SUPABASE_URL e SUPABASE_ANON_KEY estejam configuradas.
const supabaseUrl = process.env.SUPABASE_URL || 'https://moehbxectmgwisqehhlr.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZWhieGVjdG1nd2lzcWVoaGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYyMDUsImV4cCI6MjA4NDA2MjIwNX0.dNeacDBIHQUEg92iOwbrdrof5SynYgJdY-3vTLblL-o';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase: Variáveis de ambiente não detectadas. O sistema operará em modo offline/local.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
