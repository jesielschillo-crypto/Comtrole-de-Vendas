// src/lib/supabase.ts
// 1. Sempre os imports no topo
import { createClient } from '@supabase/supabase-js';

// 2. Definição das variáveis lendo o .env (completadas pelo Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 3. Verificação de configuração
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase não configurado: verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.',
  );
}

// 4. Criação e exportação do cliente padrão
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 5. Definição e exportação de funções auxiliares (se necessário)
export function getDynamicSupabaseClient() {
  // Se não houver lógica dinâmica, você pode apenas retornar o padrão
  return supabase;
}