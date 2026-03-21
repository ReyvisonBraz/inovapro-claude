/**
 * ============================================================================
 * ARQUIVO EM STANDBY PARA FUTURA MIGRAÇÃO PARA O SUPABASE
 * ============================================================================
 * 
 * Quando você for migrar do SQLite para o Supabase (e posteriormente Render),
 * você pode usar este cliente para interagir diretamente com a API do Supabase
 * no frontend ou backend.
 * 
 * Para ativar e usar:
 * 1. Instale o pacote: npm install @supabase/supabase-js
 * 2. Preencha as variáveis no seu arquivo .env (veja o .env.example)
 * 3. Descomente o código abaixo
 */

/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL ou Anon Key não encontrados nas variáveis de ambiente.');
}

// Cliente Supabase para uso geral (Frontend/Backend)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// Exemplo de uso:
// const { data, error } = await supabase.from('users').select('*');
*/
