import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Garante que o vite olhe para esta pasta
  define: {
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || 'https://moehbxectmgwisqehhlr.supabase.co'),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZWhieGVjdG1nd2lzcWVoaGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYyMDUsImV4cCI6MjA4NDA2MjIwNX0.dNeacDBIHQUEg92iOwbrdrof5SynYgJdY-3vTLblL-o'),
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  }
});